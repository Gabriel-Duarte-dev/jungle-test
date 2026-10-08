import { http } from 'msw'

import { type FieldErrors } from '@/services/http/errors'
import { type Network } from '@/services/shared.types'
import {
  type WalletPayload,
  type WalletProfile,
  type WalletProvider,
} from '@/services/wallets/wallets.types'

import { createId, getDb, mutateDb } from '../db'
import { type DbWallet } from '../db/schema'
import { resolveAuth } from '../support/auth'
import {
  applyScenario,
  conflict,
  jsonOk,
  notFound,
  sessionExpired,
  unauthenticated,
  validationError,
} from '../support/response'
import { api } from './paths'

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const PROVIDERS: WalletProvider[] = ['metamask', 'walletconnect', 'coinbase']
const ENS_TLDS = ['.eth', '.xyz', '.crypto'] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function profileFrom(payload: Partial<WalletPayload>): WalletProfile {
  return {
    displayName: payload.displayName?.trim() ?? '',
    profileName: payload.profileName?.trim() ?? '',
    referral: payload.referral?.trim() ?? '',
    email: payload.email?.trim() ?? '',
    ens: payload.ens?.trim() ?? '',
    ensTld: ENS_TLDS.includes(payload.ensTld as (typeof ENS_TLDS)[number])
      ? payload.ensTld!
      : '.eth',
    optionalEns: payload.optionalEns?.trim() ?? '',
  }
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function validateWallet(payload: Partial<WalletPayload>): FieldErrors {
  const fields: FieldErrors = {}

  if (!payload.label || payload.label.trim().length < 3) {
    fields.label = 'Dê um nome com ao menos 3 caracteres para a carteira.'
  }

  if (!payload.network || !NETWORKS.includes(payload.network)) {
    fields.network = 'Selecione uma rede compatível.'
  }

  if (!payload.provider || !PROVIDERS.includes(payload.provider)) {
    fields.provider = 'Selecione uma carteira compatível.'
  }

  if (payload.kind !== 'primary' && payload.kind !== 'secondary') {
    fields.kind = 'Informe se é a carteira principal ou secundária.'
  }

  if (payload.email?.trim() && !EMAIL.test(payload.email.trim())) {
    fields.email = 'Informe um e-mail válido.'
  }

  const address = payload.address?.trim() ?? ''
  const pattern = payload.network === 'solana' ? SOLANA_ADDRESS : EVM_ADDRESS

  if (!address) {
    fields.address = 'Informe o endereço da carteira.'
  } else if (!pattern.test(address)) {
    fields.address =
      payload.network === 'solana'
        ? 'Endereço Solana inválido (32 a 44 caracteres base58).'
        : 'Endereço inválido. Use o formato 0x seguido de 40 caracteres.'
  }

  return fields
}

function toWallet(wallet: DbWallet) {
  const { userId: _userId, ...rest } = wallet
  return { ...profileFrom(rest), ...rest }
}

export const walletHandlers = [
  http.get(api('/wallets'), async ({ request }) => {
    const short = await applyScenario('wallets.list')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const items = getDb()
      .wallets.filter((wallet) => wallet.userId === auth.userId)
      .sort((a, b) => (a.kind === 'primary' ? -1 : b.kind === 'primary' ? 1 : 0))
      .map(toWallet)

    return jsonOk({ items })
  }),

  http.post(api('/wallets'), async ({ request }) => {
    const short = await applyScenario('wallets.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const payload = (await request.json()) as Partial<WalletPayload>
    const fields = validateWallet(payload)

    if (Object.keys(fields).length > 0) return validationError(fields)

    const address = payload.address!.trim()
    const db = getDb()

    if (
      db.wallets.some(
        (wallet) =>
          wallet.userId === auth.userId && wallet.address.toLowerCase() === address.toLowerCase(),
      )
    ) {
      return conflict('conflict', 'Esta carteira já está cadastrada na sua conta.', {
        fields: { address: 'Carteira já cadastrada.' },
      })
    }

    const created = mutateDb((database) => {
      if (payload.kind === 'primary') {
        for (const wallet of database.wallets) {
          if (wallet.userId === auth.userId && wallet.kind === 'primary') {
            wallet.kind = 'secondary'
          }
        }
      }

      const wallet: DbWallet = {
        id: createId('wallet'),
        userId: auth.userId,
        label: payload.label!.trim(),
        address,
        network: payload.network!,
        kind: payload.kind!,
        provider: payload.provider!,
        createdAt: new Date().toISOString(),
        ...profileFrom(payload),
      }

      database.wallets.push(wallet)
      return wallet
    })

    return jsonOk(toWallet(created), 201)
  }),

  http.patch(api('/wallets/:walletId'), async ({ request, params }) => {
    const short = await applyScenario('wallets.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const walletId = String(params.walletId)
    const db = getDb()
    const existing = db.wallets.find(
      (wallet) => wallet.id === walletId && wallet.userId === auth.userId,
    )

    if (!existing) return notFound('Carteira não encontrada.')

    const payload = (await request.json()) as Partial<WalletPayload>
    const merged = { ...existing, ...payload }
    const fields = validateWallet(merged)

    if (Object.keys(fields).length > 0) return validationError(fields)

    const address = merged.address.trim()

    if (
      db.wallets.some(
        (wallet) =>
          wallet.id !== walletId &&
          wallet.userId === auth.userId &&
          wallet.address.toLowerCase() === address.toLowerCase(),
      )
    ) {
      return conflict('conflict', 'Esta carteira já está cadastrada na sua conta.', {
        fields: { address: 'Carteira já cadastrada.' },
      })
    }

    const updated = mutateDb((database) => {
      if (merged.kind === 'primary') {
        for (const wallet of database.wallets) {
          if (wallet.userId === auth.userId && wallet.id !== walletId) {
            wallet.kind = 'secondary'
          }
        }
      }

      const wallet = database.wallets.find((candidate) => candidate.id === walletId)!
      wallet.label = merged.label.trim()
      wallet.address = address
      wallet.network = merged.network
      wallet.kind = merged.kind
      wallet.provider = merged.provider
      Object.assign(wallet, profileFrom(merged))

      return wallet
    })

    return jsonOk(toWallet(updated))
  }),
]
