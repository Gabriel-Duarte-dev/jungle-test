import { type QueryClient } from '@tanstack/react-query'

import { multiplyEth } from '@/lib/eth'
import { type Cart } from '@/services/cart/cart.types'
import { queryKeys } from '@/services/http/queryKeys'
import { type NftDetail, type NftListResponse, type NftSummary } from '@/services/nfts/nfts.types'
import { type Order } from '@/services/orders/orders.types'
import { type NftUpdatedEvent, type OrderUpdatedEvent } from '@/realtime/events.types'

function patchSummary(item: NftSummary, event: NftUpdatedEvent): NftSummary {
  return {
    ...item,
    priceEth: event.data.priceEth,
    compareAtPriceEth: event.data.compareAtPriceEth ?? undefined,
    available: event.data.available,
    version: event.version,
  }
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent) {
  const nftId = event.resourceId

  queryClient.setQueriesData<NftListResponse>({ queryKey: ['nfts', 'list'] }, (current) => {
    if (!current) return current

    return {
      ...current,
      items: current.items.map((item) => (item.id === nftId ? patchSummary(item, event) : item)),
    }
  })

  queryClient.setQueryData<NftDetail>(queryKeys.nfts.detail(nftId), (current) => {
    if (!current) return current

    return {
      ...current,
      ...patchSummary(current, event),
      editions: current.editions.map((edition) => {
        const next = event.data.editions.find((candidate) => candidate.id === edition.id)
        return next ? { ...edition, ...next } : edition
      }),
    }
  })

  queryClient.setQueriesData<NftSummary[]>({ queryKey: ['nfts', 'related'] }, (current) =>
    current?.map((item) => (item.id === nftId ? patchSummary(item, event) : item)),
  )

  queryClient.setQueryData<{ hero: NftSummary; limitedOffer: NftSummary }>(
    queryKeys.nfts.featured,
    (current) => {
      if (!current) return current

      return {
        hero: current.hero.id === nftId ? patchSummary(current.hero, event) : current.hero,
        limitedOffer:
          current.limitedOffer.id === nftId
            ? patchSummary(current.limitedOffer, event)
            : current.limitedOffer,
      }
    },
  )

  queryClient.setQueriesData<Cart>({ queryKey: ['cart'] }, (current) => {
    if (!current) return current

    const items = current.items.map((item) => {
      if (item.nft.id !== nftId) return item

      const edition = event.data.editions.find((candidate) => candidate.id === item.editionId)
      const unitPriceEth = edition?.priceEth ?? event.data.priceEth
      const maxQuantity = edition?.available ?? 0
      const priceChanged =
        unitPriceEth !== item.unitPriceEth ? item.unitPriceEth : item.priceChangedFromEth

      return {
        ...item,
        nft: patchSummary(item.nft, event),
        unitPriceEth,
        lineTotalEth: multiplyEth(unitPriceEth, item.quantity),
        maxQuantity,
        unavailable: maxQuantity === 0,
        priceChangedFromEth: priceChanged,
      }
    })

    return { ...current, items, version: current.version + 1 }
  })

  void queryClient.invalidateQueries({ queryKey: ['quote'] })
  void queryClient.invalidateQueries({ queryKey: ['cart'] })
}

export function applyOrderUpdated(
  queryClient: QueryClient,
  event: OrderUpdatedEvent,
  owner: string,
) {
  queryClient.setQueryData<Order>(queryKeys.orders.detail(owner, event.resourceId), (current) => {
    if (!current) return current

    return {
      ...current,
      status: event.data.status,
      version: event.version,
      transaction: event.data.transaction,
      refusalReason: event.data.refusalReason,
      updatedAt: event.emittedAt,
    }
  })

  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(owner) })

  if (event.data.status === 'confirmed') {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
  }
}
