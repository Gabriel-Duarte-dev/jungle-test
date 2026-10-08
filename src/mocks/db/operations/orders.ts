import { type Network } from '@/services/shared.types'
import { type OrderCollector, type OrderItem } from '@/services/orders/orders.types'

import { getScenario } from '../../scenarios'
import { emitOrderUpdated } from '../../socket/emitter'
import { stableHash } from '../../support/hash'
import { createId, getDb, mutateDb, nextSequence } from '..'
import { type DbOrder, type DbWallet, type OwnerKey } from '../schema'
import { collectionName, findNft } from '../selectors'
import { consumeInventory } from './catalog'
import { removePurchasedItems } from './cart'

export type CreateOrderResult =
  | { ok: true; order: DbOrder; replayed: boolean }
  | {
      ok: false
      reason: 'quote_not_found' | 'quote_stale' | 'idempotency_conflict' | 'availability_conflict'
    }

export function createOrder(input: {
  ownerKey: OwnerKey
  userId: string
  idempotencyKey: string
  quoteId: string
  quoteSignature: string
  walletId: string
  network: Network
  collector: OrderCollector
}): CreateOrderResult {
  const requestHash = stableHash({
    quoteId: input.quoteId,
    quoteSignature: input.quoteSignature,
    walletId: input.walletId,
    network: input.network,
    collector: input.collector,
  })

  return mutateDb((db) => {
    const existingKey = db.idempotency.find(
      (record) => record.key === input.idempotencyKey && record.ownerKey === input.ownerKey,
    )

    if (existingKey) {
      if (existingKey.requestHash !== requestHash) {
        return { ok: false, reason: 'idempotency_conflict' } as const
      }

      const previous = db.orders.find((order) => order.id === existingKey.orderId)
      if (previous) return { ok: true, order: previous, replayed: true } as const
    }

    const quote = db.quotes.find(
      (candidate) => candidate.id === input.quoteId && candidate.ownerKey === input.ownerKey,
    )

    if (!quote) return { ok: false, reason: 'quote_not_found' } as const

    if (quote.signature !== input.quoteSignature) {
      return { ok: false, reason: 'quote_stale' } as const
    }

    for (const line of quote.lines) {
      const nft = findNft(db, line.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === line.editionId)

      if (!edition || edition.available < line.quantity || edition.status !== 'available') {
        return { ok: false, reason: 'availability_conflict' } as const
      }
    }

    const wallet = db.wallets.find(
      (candidate) => candidate.id === input.walletId && candidate.userId === input.userId,
    )

    if (!wallet) return { ok: false, reason: 'quote_not_found' } as const

    const items: OrderItem[] = quote.lines.map((line) => {
      const nft = findNft(db, line.nftId)

      return {
        nftId: line.nftId,
        nftName: line.nftName,
        collectionName: nft ? collectionName(db, nft.collectionId) : '—',
        artwork: {
          slug: nft?.artworkSlug ?? 'ape-emerald',
          alt: `${line.nftName}, item do pedido`,
        },
        editionId: line.editionId,
        editionLabel: line.editionLabel,
        quantity: line.quantity,
        unitPriceEth: line.unitPriceEth,
        lineTotalEth: line.lineTotalEth,
      }
    })

    const coupon = quote.couponCode
      ? (() => {
          const record = db.coupons.find((candidate) => candidate.code === quote.couponCode)
          return record
            ? { code: record.code, label: record.label, basisPoints: record.basisPoints }
            : null
        })()
      : null

    const scenario = getScenario()
    const now = new Date()
    const reference = `KUR-${String(nextSequence()).padStart(5, '0')}`

    const order: DbOrder = {
      id: createId('order'),
      reference,
      status: 'pending',
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      collector: input.collector,
      wallet: toOrderWallet(wallet),
      items,
      totals: {
        subtotalEth: quote.subtotalEth,
        discountEth: quote.discountEth,
        networkFeeEth: quote.networkFeeEth,
        totalEth: quote.totalEth,
      },
      coupon,
      transaction: null,
      refusalReason: null,
      ownerKey: input.ownerKey,
      userId: input.userId,
      settleAt: new Date(now.getTime() + scenario.paymentDelayMs).toISOString(),
      purchased: quote.lines.map((line) => ({
        nftId: line.nftId,
        editionId: line.editionId,
        quantity: line.quantity,
      })),
    }

    db.orders.push(order)
    db.idempotency.push({
      key: input.idempotencyKey,
      ownerKey: input.ownerKey,
      requestHash,
      orderId: order.id,
      createdAt: now.toISOString(),
    })

    db.quotes = db.quotes.filter((candidate) => candidate.id !== quote.id)

    return { ok: true, order, replayed: false } as const
  })
}

function toOrderWallet(wallet: DbWallet) {
  return {
    id: wallet.id,
    label: wallet.label,
    address: wallet.address,
    network: wallet.network,
    provider: wallet.provider,
  }
}

function transactionHashFor(order: DbOrder): string {
  return `0x${stableHash({ id: order.id, reference: order.reference }).repeat(4).slice(0, 64)}`
}

const EXPLORER_BASE: Record<Network, string> = {
  ethereum: 'https://explorer.kurio.test/eth/tx',
  polygon: 'https://explorer.kurio.test/polygon/tx',
  solana: 'https://explorer.kurio.test/solana/tx',
}

export function settleOrder(orderId: string): DbOrder | undefined {
  const settled = mutateDb((db) => {
    const order = db.orders.find((candidate) => candidate.id === orderId)
    if (!order || order.status !== 'pending') return undefined

    const outcome = getScenario().paymentOutcome
    const now = new Date().toISOString()

    order.status = outcome
    order.version += 1
    order.updatedAt = now
    order.settleAt = null

    if (outcome === 'confirmed') {
      order.transaction = {
        hash: transactionHashFor(order),
        explorerUrl: `${EXPLORER_BASE[order.wallet.network]}/${transactionHashFor(order)}`,
        network: order.wallet.network,
        confirmedAt: now,
      }
      order.refusalReason = null
    } else {
      order.transaction = null
      order.refusalReason =
        'A carteira recusou a assinatura da transação. Nenhum valor foi debitado.'
    }

    return order
  })

  if (!settled) return undefined

  if (settled.status === 'confirmed') {
    consumeInventory(settled.purchased)
    removePurchasedItems(settled.ownerKey, settled.purchased)
  }

  emitOrderUpdated(settled)

  return settled
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function scheduleSettlement(order: DbOrder): void {
  if (order.status !== 'pending' || !order.settleAt) return
  if (timers.has(order.id)) return

  const remaining = Math.max(0, Date.parse(order.settleAt) - Date.now())

  timers.set(
    order.id,
    setTimeout(() => {
      timers.delete(order.id)
      settleOrder(order.id)
    }, remaining),
  )
}

export function resumePendingOrders(): void {
  for (const order of getDb().orders) {
    scheduleSettlement(order)
  }
}

export function clearSettlementTimers(): void {
  for (const timer of timers.values()) {
    clearTimeout(timer)
  }
  timers.clear()
}
