import { http } from 'msw'

import { getDb } from '../db'
import { toggleFavorite } from '../db/operations/catalog'
import { findNft, toNftSummary } from '../db/selectors'
import { getScenario } from '../scenarios'
import { resolveAuth } from '../support/auth'
import {
  applyScenario,
  jsonOk,
  notFound,
  serverError,
  sessionExpired,
  unauthenticated,
} from '../support/response'
import { api } from './paths'

export const favoriteHandlers = [
  http.get(api('/favorites'), async ({ request }) => {
    const short = await applyScenario('favorites.list')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const db = getDb()
    const items = db.favorites
      .filter((favorite) => favorite.userId === auth.userId)
      .map((favorite) => findNft(db, favorite.nftId))
      .filter((nft): nft is NonNullable<typeof nft> => Boolean(nft))
      .map((nft) => toNftSummary(db, nft, auth.userId))

    return jsonOk({ items })
  }),

  http.put(api('/favorites/:nftId'), async ({ request, params }) => {
    const short = await applyScenario('favorites.toggle')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    if (getScenario().favoritesFail) {
      return serverError('Não foi possível salvar o favorito. Tente novamente.')
    }

    const nftId = String(params.nftId)
    if (!findNft(getDb(), nftId)) return notFound('Este NFT não existe ou saiu do catálogo.')

    toggleFavorite(auth.userId, nftId, true)

    return jsonOk({ nftId, favorited: true })
  }),

  http.delete(api('/favorites/:nftId'), async ({ request, params }) => {
    const short = await applyScenario('favorites.toggle')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    if (getScenario().favoritesFail) {
      return serverError('Não foi possível remover o favorito. Tente novamente.')
    }

    const nftId = String(params.nftId)
    toggleFavorite(auth.userId, nftId, false)

    return jsonOk({ nftId, favorited: false })
  }),
]
