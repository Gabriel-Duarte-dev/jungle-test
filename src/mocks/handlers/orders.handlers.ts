import { http } from 'msw'

import { type Network } from '@/services/shared.types'
import { type CreateOrderPayload, type Order } from '@/services/orders/orders.types'
import { type FieldErrors } from '@/services/http/errors'

import { getDb } from '../db'
import { createOrder, scheduleSettlement } from '../db/operations/orders'
import { type DbOrder } from '../db/schema'
import { getScenario } from '../scenarios'
import { IDEMPOTENCY_HEADER, resolveAuth } from '../support/auth'
import {
  applyScenario,
  conflict,
  errorResponse,
  hang,
  jsonOk,
  notFound,
  sessionExpired,
  unauthenticated,
  validationError,
} from '../support/response'
import { api } from './paths'

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function toOrder(order: DbOrder): Order {
  const {
    ownerKey: _ownerKey,
    userId: _userId,
    settleAt: _settleAt,
    purchased: _purchased,
    ...rest
  } = order

  return rest
}

function validateCollector(collector: Partial<CreateOrderPayload['collector']>): FieldErrors {
  const fields: FieldErrors = {}

  if (!collector.fullName || collector.fullName.trim().length < 3) {
    fields['collector.fullName'] = 'Informe o nome completo do colecionador.'
  }

  if (!collector.email || !EMAIL_PATTERN.test(collector.email)) {
    fields['collector.email'] = 'Informe um e-mail válido.'
  }

  return fields
}

export const orderHandlers = [
  http.post(api('/orders'), async ({ request }) => {
    const short = await applyScenario('orders.create')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER)

    if (!idempotencyKey) {
      return validationError(
        { idempotencyKey: 'Cabeçalho Idempotency-Key obrigatório.' },
        'Pedido sem chave de idempotência.',
      )
    }

    const payload = (await request.json()) as Partial<CreateOrderPayload>
    const fields = validateCollector(payload.collector ?? {})

    if (!payload.walletId) {
      fields.walletId = 'Selecione uma carteira cadastrada.'
    }

    if (!payload.network || !NETWORKS.includes(payload.network)) {
      fields.network = 'Selecione uma rede compatível.'
    }

    if (!payload.quoteId || !payload.quoteSignature) {
      fields.quoteId = 'Revise o resumo antes de confirmar.'
    }

    if (Object.keys(fields).length > 0) {
      return validationError(fields)
    }

    const result = createOrder({
      ownerKey: auth.ownerKey,
      userId: auth.userId,
      idempotencyKey,
      quoteId: payload.quoteId!,
      quoteSignature: payload.quoteSignature!,
      walletId: payload.walletId!,
      network: payload.network!,
      collector: {
        fullName: payload.collector!.fullName.trim(),
        email: payload.collector!.email.trim(),
        document: payload.collector?.document?.trim() || '',
        phone: payload.collector?.phone?.trim() || '',
      },
    })

    if (!result.ok) {
      switch (result.reason) {
        case 'idempotency_conflict':
          return conflict(
            'idempotency_conflict',
            'Esta chave de idempotência já foi usada com outro conteúdo.',
          )
        case 'quote_stale':
          return conflict(
            'quote_stale',
            'Os valores mudaram desde a sua revisão. Confira o novo resumo e confirme novamente.',
          )
        case 'availability_conflict':
          return conflict(
            'availability_conflict',
            'A disponibilidade mudou durante a compra. Revise os itens do pedido.',
          )
        case 'quote_not_found':
          return errorResponse(
            422,
            'quote_stale',
            'Não encontramos a cotação informada. Revise o resumo e tente novamente.',
          )
      }
    }

    scheduleSettlement(result.order)

    if (getScenario().orderTimeout && !result.replayed) {
      await hang()
    }

    return jsonOk(toOrder(result.order), result.replayed ? 200 : 201)
  }),

  http.get(api('/orders'), async ({ request }) => {
    const short = await applyScenario('orders.get')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const items = getDb()
      .orders.filter((order) => order.userId === auth.userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(toOrder)

    return jsonOk({ items })
  }),

  http.get(api('/orders/:orderId'), async ({ request, params }) => {
    const short = await applyScenario('orders.get')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const order = getDb().orders.find((candidate) => candidate.id === String(params.orderId))

    if (!order) return notFound('Pedido não encontrado.')

    if (order.userId !== auth.userId) return notFound('Pedido não encontrado.')

    scheduleSettlement(order)

    return jsonOk(toOrder(order))
  }),
]
