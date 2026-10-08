import { http } from 'msw'

import { type Network } from '@/services/shared.types'

import { createQuote } from '../db/operations/quote'
import { resolveAuth } from '../support/auth'
import { applyScenario, errorResponse, jsonOk, sessionExpired } from '../support/response'
import { api } from './paths'

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']

export const quoteHandlers = [
  http.post(api('/cart/quote'), async ({ request }) => {
    const short = await applyScenario('quote.create')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    const payload = (await request.json().catch(() => ({}))) as {
      couponCode?: string | null
      network?: string
    }

    const network = NETWORKS.includes(payload.network as Network)
      ? (payload.network as Network)
      : 'ethereum'

    const result = createQuote(auth.ownerKey, { couponCode: payload.couponCode, network })

    if (!result.ok) {
      switch (result.reason) {
        case 'empty_cart':
          return errorResponse(422, 'validation_error', 'Seu carrinho está vazio.')
        case 'coupon_invalid':
          return errorResponse(
            422,
            'coupon_invalid',
            'Cupom inválido. Confira o código digitado.',
            {
              fields: { couponCode: 'Cupom inválido.' },
            },
          )
        case 'coupon_expired':
          return errorResponse(422, 'coupon_expired', 'Este cupom expirou.', {
            fields: { couponCode: 'Cupom expirado.' },
          })
      }
    }

    return jsonOk(result.quote)
  }),
]
