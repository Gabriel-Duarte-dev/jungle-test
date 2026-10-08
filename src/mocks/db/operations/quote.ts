import { addEth, compareEth, multiplyEth, percentageOfEth, subEth } from '@/lib/eth'
import { type Network } from '@/services/shared.types'
import { type Quote, type QuoteLine, type QuoteWarning } from '@/services/quote/quote.types'

import { stableHash } from '../../support/hash'
import { createId, mutateDb } from '..'
import { NETWORK_FEES, type DbQuote, type OwnerKey } from '../schema'
import { findCart, findNft } from '../selectors'

const QUOTE_TTL_MS = 5 * 60_000

export type QuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; reason: 'empty_cart' | 'coupon_invalid' | 'coupon_expired' }

export function createQuote(
  ownerKey: OwnerKey,
  input: { couponCode?: string | null; network?: Network },
): QuoteResult {
  return mutateDb((db) => {
    const cart = findCart(db, ownerKey)

    if (!cart || cart.items.length === 0) {
      return { ok: false, reason: 'empty_cart' } as const
    }

    const requestedCode = input.couponCode?.trim().toUpperCase() || null
    let coupon: Quote['coupon'] = null

    if (requestedCode) {
      const record = db.coupons.find((candidate) => candidate.code === requestedCode)

      if (!record || !record.active) {
        return { ok: false, reason: 'coupon_invalid' } as const
      }

      if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
        return { ok: false, reason: 'coupon_expired' } as const
      }

      coupon = { code: record.code, label: record.label, basisPoints: record.basisPoints }
    }

    const lines: QuoteLine[] = []
    const warnings: QuoteWarning[] = []

    for (const item of cart.items) {
      const nft = findNft(db, item.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)

      if (!nft || !edition) continue

      if (edition.status !== 'available' || edition.available === 0) {
        warnings.push({
          code: 'item_unavailable',
          nftId: nft.id,
          editionId: edition.id,
          message: `${nft.name} — edição esgotada e removida do resumo.`,
        })
        continue
      }

      const quantity = Math.min(item.quantity, edition.available)

      if (quantity < item.quantity) {
        warnings.push({
          code: 'quantity_reduced',
          nftId: nft.id,
          editionId: edition.id,
          message: `${nft.name} — quantidade ajustada para ${quantity} unidade(s) disponível(is).`,
          previousValue: String(item.quantity),
          currentValue: String(quantity),
        })
      }

      if (compareEth(item.knownUnitPriceEth, edition.priceEth) !== 0) {
        warnings.push({
          code: 'price_changed',
          nftId: nft.id,
          editionId: edition.id,
          message: `${nft.name} — preço atualizado.`,
          previousValue: item.knownUnitPriceEth,
          currentValue: edition.priceEth,
        })
      }

      lines.push({
        nftId: nft.id,
        nftName: nft.name,
        editionId: edition.id,
        editionLabel: `Edição ${edition.number} de ${edition.totalInRun}`,
        quantity,
        unitPriceEth: edition.priceEth,
        lineTotalEth: multiplyEth(edition.priceEth, quantity),
      })
    }

    if (lines.length === 0) {
      return { ok: false, reason: 'empty_cart' } as const
    }

    const network = input.network ?? 'ethereum'
    const subtotalEth = addEth(...lines.map((line) => line.lineTotalEth))
    const discountEth = coupon ? percentageOfEth(subtotalEth, coupon.basisPoints) : '0'
    const networkFeeEth = NETWORK_FEES[network]
    const totalEth = addEth(subEth(subtotalEth, discountEth), networkFeeEth)

    const issuedAt = new Date()
    const signature = stableHash({
      lines: lines.map((line) => [line.nftId, line.editionId, line.quantity, line.unitPriceEth]),
      couponCode: coupon?.code ?? null,
      network,
      totalEth,
    })

    const record: DbQuote = {
      id: createId('quote'),
      ownerKey,
      lines,
      subtotalEth,
      discountEth,
      networkFeeEth,
      totalEth,
      couponCode: coupon?.code ?? null,
      network,
      signature,
      issuedAt: issuedAt.toISOString(),
      expiresAt: new Date(issuedAt.getTime() + QUOTE_TTL_MS).toISOString(),
    }

    db.quotes = db.quotes.filter((candidate) => candidate.ownerKey !== ownerKey)
    db.quotes.push(record)

    return {
      ok: true,
      quote: {
        id: record.id,
        lines: record.lines,
        subtotalEth: record.subtotalEth,
        discountEth: record.discountEth,
        networkFeeEth: record.networkFeeEth,
        totalEth: record.totalEth,
        coupon,
        warnings,
        issuedAt: record.issuedAt,
        expiresAt: record.expiresAt,
        signature: record.signature,
      },
    } as const
  })
}

export function findQuote(ownerKey: OwnerKey, quoteId: string, db: { quotes: DbQuote[] }) {
  return db.quotes.find((quote) => quote.id === quoteId && quote.ownerKey === ownerKey)
}
