import { addEth, compareEth, multiplyEth } from '@/lib/eth'
import { type FacetOption } from '@/services/shared.types'
import {
  type NftDetail,
  type NftListParams,
  type NftListResponse,
  type NftSummary,
} from '@/services/nfts/nfts.types'
import { type Cart, type CartItem } from '@/services/cart/cart.types'
import { NETWORK_LABELS } from '@/services/shared.types'

import { type DbCart, type DbNft, type MockDatabase, type OwnerKey } from './schema'

export const DEFAULT_PER_PAGE = 9

export function ownerKeyFor(userId: string | null, guestId: string): OwnerKey {
  return userId ? `user:${userId}` : `guest:${guestId}`
}

function artworkAlt(nft: DbNft): string {
  return `${nft.name}, arte digital de ${nft.creator.name}`
}

export function isFavorite(db: MockDatabase, nftId: string, userId: string | null): boolean {
  if (!userId) return false
  return db.favorites.some((favorite) => favorite.userId === userId && favorite.nftId === nftId)
}

export function collectionName(db: MockDatabase, collectionId: string): string {
  return db.collections.find((collection) => collection.id === collectionId)?.name ?? collectionId
}

export function toNftSummary(db: MockDatabase, nft: DbNft, userId: string | null): NftSummary {
  const summary: NftSummary = {
    id: nft.id,
    name: nft.name,
    collection: { id: nft.collectionId, name: collectionName(db, nft.collectionId) },
    network: nft.network,
    rarity: nft.rarity,
    priceEth: nft.priceEth,
    artwork: { slug: nft.artworkSlug, alt: artworkAlt(nft) },
    available: nft.editions.reduce((total, edition) => total + edition.available, 0),
    version: nft.version,
    isFavorite: isFavorite(db, nft.id, userId),
  }

  if (nft.compareAtPriceEth) {
    summary.compareAtPriceEth = nft.compareAtPriceEth
  }

  return summary
}

export function toNftDetail(db: MockDatabase, nft: DbNft, userId: string | null): NftDetail {
  return {
    ...toNftSummary(db, nft, userId),
    description: nft.description,
    creator: nft.creator,
    attributes: nft.attributes,
    editions: nft.editions.map((edition) => ({
      id: edition.id,
      label: `Edição ${edition.number} de ${edition.totalInRun}`,
      number: edition.number,
      totalInRun: edition.totalInRun,
      priceEth: edition.priceEth,
      available: edition.available,
      status: edition.status,
    })),
    gallery: nft.gallerySlugs.map((slug, index) => ({
      slug,
      alt: index === 0 ? artworkAlt(nft) : `${nft.name}, detalhe ${index + 1}`,
    })),
    mintedAt: nft.mintedAt,
    tokenStandard: nft.tokenStandard,
    contractAddress: nft.contractAddress,
    royaltiesPct: nft.royaltiesPct,
    stats: nft.stats,
  }
}

type NftPredicate = (nft: DbNft) => boolean

function buildPredicates(db: MockDatabase, params: NftListParams) {
  const search = params.q?.trim().toLowerCase()

  const predicates: Record<string, NftPredicate> = {
    search: (nft) => {
      if (!search) return true
      const haystack = `${nft.name} ${collectionName(db, nft.collectionId)} ${nft.creator.name}`
      return haystack.toLowerCase().includes(search)
    },
    collections: (nft) =>
      !params.collections?.length || params.collections.includes(nft.collectionId),
    networks: (nft) => !params.networks?.length || params.networks.includes(nft.network),
    price: (nft) => {
      if (params.minPrice && compareEth(nft.priceEth, params.minPrice) < 0) return false
      if (params.maxPrice && compareEth(nft.priceEth, params.maxPrice) > 0) return false
      return true
    },
    tab: (nft) => {
      if (params.tab === 'new') return nft.isNewRelease
      if (params.tab === 'trending') return nft.isTrending
      return true
    },
  }

  return predicates
}

function matchesAll(nft: DbNft, predicates: Record<string, NftPredicate>): boolean {
  return Object.values(predicates).every((predicate) => predicate(nft))
}

function facetCounts(
  nfts: DbNft[],
  predicates: Record<string, NftPredicate>,
  excludedKey: string,
  keyOf: (nft: DbNft) => string,
): Map<string, number> {
  const others = Object.fromEntries(
    Object.entries(predicates).filter(([key]) => key !== excludedKey),
  )

  const counts = new Map<string, number>()

  for (const nft of nfts) {
    if (!matchesAll(nft, others)) continue
    const key = keyOf(nft)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}

function sortNfts(nfts: DbNft[], sort: NftListParams['sort']): DbNft[] {
  const sorted = [...nfts]

  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => compareEth(a.priceEth, b.priceEth) || a.id.localeCompare(b.id))
    case 'price_desc':
      return sorted.sort((a, b) => compareEth(b.priceEth, a.priceEth) || a.id.localeCompare(b.id))
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    case 'popular':
      return sorted.sort((a, b) => b.popularity - a.popularity || a.id.localeCompare(b.id))
    case 'recent':
    default:
      return sorted.sort(
        (a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt) || a.id.localeCompare(b.id),
      )
  }
}

export function listNfts(
  db: MockDatabase,
  params: NftListParams,
  userId: string | null,
): NftListResponse {
  const predicates = buildPredicates(db, params)
  const matching = db.nfts.filter((nft) => matchesAll(nft, predicates))

  const perPage = params.perPage ?? DEFAULT_PER_PAGE
  const total = matching.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const page = Math.min(Math.max(params.page ?? 1, 1), totalPages)

  const sorted = sortNfts(matching, params.sort)
  const start = (page - 1) * perPage
  const items = sorted.slice(start, start + perPage)

  const collectionCounts = facetCounts(
    db.nfts,
    predicates,
    'collections',
    (nft) => nft.collectionId,
  )
  const networkCounts = facetCounts(db.nfts, predicates, 'networks', (nft) => nft.network)

  const collections: FacetOption[] = db.collections.map((collection) => ({
    id: collection.id,
    label: collection.name,
    count: collectionCounts.get(collection.id) ?? 0,
  }))

  const networks: FacetOption[] = (
    Object.keys(NETWORK_LABELS) as Array<keyof typeof NETWORK_LABELS>
  ).map((network) => ({
    id: network,
    label: NETWORK_LABELS[network],
    count: networkCounts.get(network) ?? 0,
  }))

  const prices = db.nfts.map((nft) => nft.priceEth)
  const minEth = prices.reduce(
    (min, price) => (compareEth(price, min) < 0 ? price : min),
    prices[0],
  )
  const maxEth = prices.reduce(
    (max, price) => (compareEth(price, max) > 0 ? price : max),
    prices[0],
  )

  return {
    items: items.map((nft) => toNftSummary(db, nft, userId)),
    page,
    perPage,
    total,
    totalPages,
    facets: { collections, networks, priceRange: { minEth, maxEth } },
  }
}

export function findNft(db: MockDatabase, nftId: string): DbNft | undefined {
  return db.nfts.find((nft) => nft.id === nftId)
}

export function findCart(db: MockDatabase, ownerKey: OwnerKey): DbCart | undefined {
  return db.carts.find((cart) => cart.ownerKey === ownerKey)
}

export function toCart(db: MockDatabase, cart: DbCart | undefined, userId: string | null): Cart {
  if (!cart) {
    return {
      id: 'cart-empty',
      items: [],
      itemCount: 0,
      subtotalEth: '0',
      updatedAt: new Date().toISOString(),
      version: 0,
    }
  }

  const items: CartItem[] = []

  for (const item of cart.items) {
    const nft = findNft(db, item.nftId)
    if (!nft) continue

    const edition = nft.editions.find((candidate) => candidate.id === item.editionId)
    if (!edition) continue

    const unitPriceEth = edition.priceEth
    const unavailable = edition.status !== 'available' || edition.available === 0

    const cartItem: CartItem = {
      id: item.id,
      nft: toNftSummary(db, nft, userId),
      editionId: edition.id,
      editionLabel: `Edição ${edition.number} de ${edition.totalInRun}`,
      quantity: item.quantity,
      unitPriceEth,
      lineTotalEth: multiplyEth(unitPriceEth, item.quantity),
      maxQuantity: Math.max(edition.available, unavailable ? 0 : item.quantity),
      unavailable,
    }

    if (compareEth(item.knownUnitPriceEth, unitPriceEth) !== 0) {
      cartItem.priceChangedFromEth = item.knownUnitPriceEth
    }

    items.push(cartItem)
  }

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalEth: items.length ? addEth(...items.map((item) => item.lineTotalEth)) : '0',
    updatedAt: cart.updatedAt,
    version: cart.version,
  }
}
