import { type Network } from '@/services/shared.types'
import { type NftListParams, type NftSort, type NftTab } from '@/services/nfts/nfts.types'

export const TABS: NftTab[] = ['all', 'new', 'trending']
export const SORTS: NftSort[] = ['recent', 'price_asc', 'price_desc', 'name_asc', 'popular']
export const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']

export const TAB_LABELS: Record<NftTab, string> = {
  all: 'Todos os NFTs',
  new: 'Novos lançamentos',
  trending: 'Em alta',
}

export const SORT_LABELS: Record<NftSort, string> = {
  recent: 'Listados recentemente',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  name_asc: 'Nome A–Z',
  popular: 'Mais populares',
}

export interface CatalogSearch {
  q?: string
  collections?: string[]
  networks?: Network[]
  minPrice?: string
  maxPrice?: string
  tab?: NftTab
  sort?: NftSort
  page?: number
  scenario?: string
}

export function asStringArray(value: unknown): string[] | undefined {
  if (value == null || value === '') return undefined
  const list = Array.isArray(value) ? value.map(String) : [String(value)]
  const cleaned = list.map((item) => item.trim()).filter(Boolean)
  return cleaned.length ? cleaned : undefined
}

function asTab(value: unknown): NftTab | undefined {
  return TABS.includes(value as NftTab) ? (value as NftTab) : undefined
}

function asSort(value: unknown): NftSort | undefined {
  return SORTS.includes(value as NftSort) ? (value as NftSort) : undefined
}

function asNetworks(value: unknown): Network[] | undefined {
  const list = asStringArray(value)?.filter((item): item is Network =>
    NETWORKS.includes(item as Network),
  )
  return list?.length ? list : undefined
}

function asPage(value: unknown): number | undefined {
  const page = Number(value)
  if (!Number.isFinite(page) || page < 1) return undefined
  return Math.floor(page)
}

export function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const result: CatalogSearch = {}
  const q = typeof search.q === 'string' ? search.q.trim() : ''
  const collections = asStringArray(search.collections)
  const networks = asNetworks(search.networks)
  const minPrice = typeof search.minPrice === 'string' ? search.minPrice : undefined
  const maxPrice = typeof search.maxPrice === 'string' ? search.maxPrice : undefined
  const tab = asTab(search.tab)
  const sort = asSort(search.sort)
  const page = asPage(search.page)
  const scenario = typeof search.scenario === 'string' ? search.scenario : undefined

  if (q) result.q = q
  if (collections) result.collections = collections
  if (networks) result.networks = networks
  if (minPrice) result.minPrice = minPrice
  if (maxPrice) result.maxPrice = maxPrice
  if (tab && tab !== 'all') result.tab = tab
  if (sort && sort !== 'recent') result.sort = sort
  if (page && page > 1) result.page = page
  if (scenario) result.scenario = scenario

  return result
}

export function catalogSearchToParams(search: CatalogSearch): NftListParams {
  return {
    q: search.q,
    collections: search.collections,
    networks: search.networks,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    tab: search.tab ?? 'all',
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
    perPage: 9,
  }
}

export function hasActiveFilters(search: CatalogSearch) {
  return Boolean(
    search.q ||
    search.collections?.length ||
    search.networks?.length ||
    search.minPrice ||
    search.maxPrice ||
    (search.tab && search.tab !== 'all'),
  )
}
