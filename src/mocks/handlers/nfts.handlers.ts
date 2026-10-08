import { http } from 'msw'

import { type Network } from '@/services/shared.types'
import { type NftListParams, type NftSort, type NftTab } from '@/services/nfts/nfts.types'

import { getDb } from '../db'
import { DEFAULT_PER_PAGE, findNft, listNfts, toNftDetail, toNftSummary } from '../db/selectors'
import { getScenario } from '../scenarios'
import { resolveAuth } from '../support/auth'
import { applyScenario, jsonOk, notFound } from '../support/response'
import { api } from './paths'

const SORTS: NftSort[] = ['recent', 'price_asc', 'price_desc', 'name_asc', 'popular']
const TABS: NftTab[] = ['all', 'new', 'trending']
const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']

function readParams(url: URL): NftListParams {
  const params = url.searchParams

  const sort = params.get('sort')
  const tab = params.get('tab')
  const page = Number(params.get('page') ?? '1')
  const perPage = Number(params.get('perPage') ?? String(DEFAULT_PER_PAGE))

  const collections = params.getAll('collections').filter(Boolean)
  const networks = params
    .getAll('networks')
    .filter((value): value is Network => NETWORKS.includes(value as Network))

  const result: NftListParams = {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    perPage:
      Number.isFinite(perPage) && perPage > 0
        ? Math.min(Math.floor(perPage), 48)
        : DEFAULT_PER_PAGE,
    sort: SORTS.includes(sort as NftSort) ? (sort as NftSort) : 'recent',
    tab: TABS.includes(tab as NftTab) ? (tab as NftTab) : 'all',
  }

  const q = params.get('q')?.trim()
  if (q) result.q = q
  if (collections.length) result.collections = collections
  if (networks.length) result.networks = networks

  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  if (minPrice) result.minPrice = minPrice
  if (maxPrice) result.maxPrice = maxPrice

  return result
}

export const nftHandlers = [
  http.get(api('/nfts'), async ({ request }) => {
    const short = await applyScenario('nfts.list')
    if (short) return short

    const db = getDb()
    const { userId } = resolveAuth(request)
    const params = readParams(new URL(request.url))

    if (getScenario().emptyCatalog) {
      const empty = listNfts(db, { ...params, q: '__sem-resultados__' }, userId)
      return jsonOk(empty)
    }

    return jsonOk(listNfts(db, params, userId))
  }),

  http.get(api('/nfts/featured'), async ({ request }) => {
    const short = await applyScenario('nfts.featured')
    if (short) return short

    const db = getDb()
    const { userId } = resolveAuth(request)

    const hero = findNft(db, 'emerald-ape-042') ?? db.nfts[0]
    const limitedOffer = findNft(db, 'sage-nomad-009') ?? db.nfts[1]

    return jsonOk({
      hero: toNftSummary(db, hero, userId),
      limitedOffer: toNftSummary(db, limitedOffer, userId),
    })
  }),

  http.get(api('/nfts/:nftId'), async ({ request, params }) => {
    const short = await applyScenario('nfts.detail')
    if (short) return short

    const db = getDb()
    const { userId } = resolveAuth(request)
    const nft = findNft(db, String(params.nftId))

    if (!nft) {
      return notFound('Este NFT não existe ou saiu do catálogo.')
    }

    return jsonOk(toNftDetail(db, nft, userId))
  }),

  http.get(api('/nfts/:nftId/related'), async ({ request, params }) => {
    const short = await applyScenario('nfts.detail')
    if (short) return short

    const db = getDb()
    const { userId } = resolveAuth(request)
    const nft = findNft(db, String(params.nftId))

    if (!nft) return notFound('Este NFT não existe ou saiu do catálogo.')

    const related = db.nfts
      .filter((candidate) => candidate.collectionId === nft.collectionId && candidate.id !== nft.id)
      .slice(0, 5)
      .map((candidate) => toNftSummary(db, candidate, userId))

    return jsonOk({ items: related })
  }),
]
