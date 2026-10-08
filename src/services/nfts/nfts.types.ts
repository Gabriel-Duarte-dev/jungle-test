import {
  type ArtworkRef,
  type EthAmount,
  type FacetOption,
  type Network,
  type Paginated,
  type Rarity,
} from '../shared.types'

export type NftId = string

export interface CollectionRef {
  id: string
  name: string
}

export type EditionStatus = 'available' | 'sold_out' | 'unavailable'

export interface NftEdition {
  id: string
  label: string

  number: number
  totalInRun: number
  priceEth: EthAmount

  available: number
  status: EditionStatus
}

export interface NftSummary {
  id: NftId
  name: string
  collection: CollectionRef
  network: Network
  rarity: Rarity
  priceEth: EthAmount

  compareAtPriceEth?: EthAmount
  artwork: ArtworkRef
  available: number

  version: number
  isFavorite: boolean
}

export interface NftAttribute {
  trait: string
  value: string

  rarityPct: number
}

export interface NftCreator {
  name: string
  handle: string
  verified: boolean
}

export interface NftDetail extends NftSummary {
  description: string
  creator: NftCreator
  attributes: NftAttribute[]
  editions: NftEdition[]
  gallery: ArtworkRef[]
  mintedAt: string
  tokenStandard: string
  contractAddress: string
  royaltiesPct: number
  stats: {
    views: number
    favorites: number
    owners: number
  }
}

export type NftTab = 'all' | 'new' | 'trending'

export type NftSort = 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'

export interface NftListParams {
  q?: string
  collections?: string[]
  networks?: Network[]
  minPrice?: EthAmount
  maxPrice?: EthAmount
  tab?: NftTab
  sort?: NftSort
  page?: number
  perPage?: number
}

export interface NftFacets {
  collections: FacetOption[]
  networks: FacetOption[]
  priceRange: {
    minEth: EthAmount
    maxEth: EthAmount
  }
}

export interface NftListResponse extends Paginated<NftSummary> {
  facets: NftFacets
}

export interface FeaturedResponse {
  hero: NftSummary
  limitedOffer: NftSummary
}
