import { http } from 'msw'

import { type AddCartItemPayload, type UpdateCartItemPayload } from '@/services/cart/cart.types'

import { getDb } from '../db'
import {
  acknowledgePrices,
  addItem,
  type CartMutationResult,
  getOrCreateCart,
  removeItem,
  updateItemQuantity,
} from '../db/operations/cart'
import { findCart, toCart } from '../db/selectors'
import { resolveAuth } from '../support/auth'
import {
  applyScenario,
  conflict,
  jsonOk,
  notFound,
  sessionExpired,
  validationError,
} from '../support/response'
import { api } from './paths'

function failureResponse(result: Extract<CartMutationResult, { ok: false }>) {
  switch (result.reason) {
    case 'nft_not_found':
      return notFound('Este NFT não existe ou saiu do catálogo.')
    case 'edition_not_found':
      return notFound('Esta edição não está mais disponível.')
    case 'item_not_found':
      return notFound('Este item não está mais no carrinho.')
    case 'unavailable':
      return conflict(
        'availability_conflict',
        result.max && result.max > 0
          ? `Restam apenas ${result.max} unidade(s) desta edição.`
          : 'Esta edição esgotou.',
        { details: { maxQuantity: result.max ?? 0 } },
      )
  }
}

export const cartHandlers = [
  http.get(api('/cart'), async ({ request }) => {
    const short = await applyScenario('cart.get')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    const db = getDb()

    return jsonOk(toCart(db, findCart(db, auth.ownerKey), auth.userId))
  }),

  http.post(api('/cart/items'), async ({ request }) => {
    const short = await applyScenario('cart.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    const payload = (await request.json()) as Partial<AddCartItemPayload>

    if (!payload.nftId || !payload.editionId) {
      return validationError({ editionId: 'Selecione uma edição disponível.' })
    }

    const quantity = Number(payload.quantity ?? 1)

    if (!Number.isInteger(quantity) || quantity < 1) {
      return validationError({ quantity: 'A quantidade precisa ser um número inteiro positivo.' })
    }

    getOrCreateCart(auth.ownerKey)

    const result = addItem(auth.ownerKey, {
      nftId: payload.nftId,
      editionId: payload.editionId,
      quantity,
    })

    if (!result.ok) return failureResponse(result)

    const db = getDb()
    return jsonOk(toCart(db, result.cart, auth.userId), 201)
  }),

  http.patch(api('/cart/items/:itemId'), async ({ request, params }) => {
    const short = await applyScenario('cart.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    const payload = (await request.json()) as Partial<UpdateCartItemPayload>
    const quantity = Number(payload.quantity)

    if (!Number.isInteger(quantity) || quantity < 1) {
      return validationError({ quantity: 'A quantidade precisa ser um número inteiro positivo.' })
    }

    const result = updateItemQuantity(auth.ownerKey, String(params.itemId), quantity)
    if (!result.ok) return failureResponse(result)

    const db = getDb()
    return jsonOk(toCart(db, result.cart, auth.userId))
  }),

  http.delete(api('/cart/items/:itemId'), async ({ request, params }) => {
    const short = await applyScenario('cart.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    const result = removeItem(auth.ownerKey, String(params.itemId))
    if (!result.ok) return failureResponse(result)

    const db = getDb()
    return jsonOk(toCart(db, result.cart, auth.userId))
  }),

  http.post(api('/cart/acknowledge'), async ({ request }) => {
    const short = await applyScenario('cart.mutate')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()

    acknowledgePrices(auth.ownerKey)

    const db = getDb()
    return jsonOk(toCart(db, findCart(db, auth.ownerKey), auth.userId))
  }),
]
