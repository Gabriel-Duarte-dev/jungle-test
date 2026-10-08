import { httpClient } from '../http/axios'
import { type NftSummary } from '../nfts/nfts.types'

export async function fetchFavorites(signal?: AbortSignal): Promise<NftSummary[]> {
  const { data } = await httpClient.get<{ items: NftSummary[] }>('/favorites', { signal })
  return data.items
}

export async function addFavorite(nftId: string): Promise<void> {
  await httpClient.put(`/favorites/${encodeURIComponent(nftId)}`)
}

export async function removeFavorite(nftId: string): Promise<void> {
  await httpClient.delete(`/favorites/${encodeURIComponent(nftId)}`)
}
