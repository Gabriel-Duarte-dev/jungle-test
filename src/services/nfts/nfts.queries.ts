import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { queryKeys } from '../http/queryKeys'
import { fetchFeatured, fetchNftDetail, fetchNfts, fetchRelatedNfts } from './nfts.api'
import { type NftListParams } from './nfts.types'

export function useNftListQuery(params: NftListParams) {
  return useQuery({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useNftDetailQuery(nftId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => fetchNftDetail(nftId, signal),
    enabled: options.enabled ?? Boolean(nftId),

    retry: false,
  })
}

export function useRelatedNftsQuery(nftId: string) {
  return useQuery({
    queryKey: queryKeys.nfts.related(nftId),
    queryFn: ({ signal }) => fetchRelatedNfts(nftId, signal),
    enabled: Boolean(nftId),
  })
}

export function useFeaturedQuery() {
  return useQuery({
    queryKey: queryKeys.nfts.featured,
    queryFn: ({ signal }) => fetchFeatured(signal),
    staleTime: 60_000,
  })
}
