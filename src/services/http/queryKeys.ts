import { type NftListParams } from '../nfts/nfts.types'

export const queryKeys = {
  session: ['session'] as const,

  nfts: {
    all: ['nfts'] as const,
    list: (params: NftListParams) => ['nfts', 'list', normalizeListParams(params)] as const,
    detail: (nftId: string) => ['nfts', 'detail', nftId] as const,
    related: (nftId: string) => ['nfts', 'related', nftId] as const,
    featured: ['nfts', 'featured'] as const,
  },

  favorites: (owner: string) => ['favorites', owner] as const,

  cart: (owner: string) => ['cart', owner] as const,

  quote: (owner: string, couponCode: string | null, network: string) =>
    ['quote', owner, couponCode ?? 'none', network] as const,

  orders: {
    all: (owner: string) => ['orders', owner] as const,
    detail: (owner: string, orderId: string) => ['orders', owner, orderId] as const,
  },

  profile: (owner: string) => ['profile', owner] as const,

  wallets: (owner: string) => ['wallets', owner] as const,

  scenario: ['mock', 'scenario'] as const,
}

export function normalizeListParams(params: NftListParams) {
  return {
    q: params.q?.trim() || undefined,
    collections: params.collections?.length ? [...params.collections].sort() : undefined,
    networks: params.networks?.length ? [...params.networks].sort() : undefined,
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined,
    tab: params.tab ?? 'all',
    sort: params.sort ?? 'recent',
    page: params.page ?? 1,
    perPage: params.perPage ?? 9,
  }
}
