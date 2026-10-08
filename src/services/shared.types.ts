export type { EthAmount } from '@/lib/eth'

export interface Paginated<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ArtworkRef {
  slug: string
  alt: string
}

export type Network = 'ethereum' | 'polygon' | 'solana'

export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario'

export const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
}

export interface FacetOption {
  id: string
  label: string
  count: number
}
