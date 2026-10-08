import { httpClient } from '../http/axios'
import {
  type NftDetail,
  type NftListParams,
  type NftListResponse,
  type NftSummary,
} from './nfts.types'

export function toSearchParams(params: NftListParams): URLSearchParams {
  const search = new URLSearchParams()

  if (params.q) search.set('q', params.q)
  if (params.minPrice) search.set('minPrice', params.minPrice)
  if (params.maxPrice) search.set('maxPrice', params.maxPrice)
  if (params.tab) search.set('tab', params.tab)
  if (params.sort) search.set('sort', params.sort)
  if (params.page) search.set('page', String(params.page))
  if (params.perPage) search.set('perPage', String(params.perPage))

  for (const collection of params.collections ?? []) {
    search.append('collections', collection)
  }

  for (const network of params.networks ?? []) {
    search.append('networks', network)
  }

  return search
}

export async function fetchNfts(
  params: NftListParams,
  signal?: AbortSignal,
): Promise<NftListResponse> {
  const query = toSearchParams(params).toString()
  const { data } = await httpClient.get<NftListResponse>(query ? `/nfts?${query}` : '/nfts', {
    signal,
  })

  return data
}

export async function fetchNftDetail(nftId: string, signal?: AbortSignal): Promise<NftDetail> {
  const { data } = await httpClient.get<NftDetail>(`/nfts/${encodeURIComponent(nftId)}`, { signal })
  return data
}

export async function fetchRelatedNfts(nftId: string, signal?: AbortSignal): Promise<NftSummary[]> {
  const { data } = await httpClient.get<{ items: NftSummary[] }>(
    `/nfts/${encodeURIComponent(nftId)}/related`,
    { signal },
  )

  return data.items
}

export async function fetchFeatured(
  signal?: AbortSignal,
): Promise<{ hero: NftSummary; limitedOffer: NftSummary }> {
  const { data } = await httpClient.get<{ hero: NftSummary; limitedOffer: NftSummary }>(
    '/nfts/featured',
    { signal },
  )

  return data
}
