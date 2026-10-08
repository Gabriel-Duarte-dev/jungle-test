import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../http/queryKeys'
import { useOwnerKey, useSessionQuery } from '../auth/auth.queries'
import { type NftDetail, type NftListResponse, type NftSummary } from '../nfts/nfts.types'
import { addFavorite, fetchFavorites, removeFavorite } from './favorites.api'

export function useFavoritesQuery() {
  const owner = useOwnerKey()
  const { user } = useSessionQuery()

  return useQuery({
    queryKey: queryKeys.favorites(owner),
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled: Boolean(user),
  })
}

function patchFavoriteInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  nftId: string,
  isFavorite: boolean,
) {
  queryClient.setQueriesData<NftListResponse>({ queryKey: ['nfts', 'list'] }, (current) => {
    if (!current) return current

    return {
      ...current,
      items: current.items.map((item) => (item.id === nftId ? { ...item, isFavorite } : item)),
    }
  })

  queryClient.setQueryData<NftDetail>(queryKeys.nfts.detail(nftId), (current) =>
    current ? { ...current, isFavorite } : current,
  )

  queryClient.setQueriesData<NftSummary[]>({ queryKey: ['nfts', 'related'] }, (current) =>
    current?.map((item) => (item.id === nftId ? { ...item, isFavorite } : item)),
  )
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn: ({ nftId, favorited }: { nftId: string; favorited: boolean }) =>
      favorited ? addFavorite(nftId) : removeFavorite(nftId),

    onMutate: async ({ nftId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites(owner) })

      const snapshot = {
        lists: queryClient.getQueriesData<NftListResponse>({ queryKey: ['nfts', 'list'] }),
        detail: queryClient.getQueryData<NftDetail>(queryKeys.nfts.detail(nftId)),
        related: queryClient.getQueriesData<NftSummary[]>({ queryKey: ['nfts', 'related'] }),
        favorites: queryClient.getQueryData<NftSummary[]>(queryKeys.favorites(owner)),
      }

      patchFavoriteInCache(queryClient, nftId, favorited)

      queryClient.setQueryData<NftSummary[]>(queryKeys.favorites(owner), (current) => {
        if (!current) return current
        if (!favorited) return current.filter((item) => item.id !== nftId)

        const detail = snapshot.detail
        if (current.some((item) => item.id === nftId) || !detail) return current

        return [...current, { ...detail, isFavorite: true }]
      })

      return snapshot
    },

    onError: (_error, _variables, snapshot) => {
      if (!snapshot) return

      for (const [key, value] of snapshot.lists) {
        queryClient.setQueryData(key, value)
      }
      for (const [key, value] of snapshot.related) {
        queryClient.setQueryData(key, value)
      }

      queryClient.setQueryData(queryKeys.nfts.detail(_variables.nftId), snapshot.detail)
      queryClient.setQueryData(queryKeys.favorites(owner), snapshot.favorites)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites(owner) })
    },
  })
}
