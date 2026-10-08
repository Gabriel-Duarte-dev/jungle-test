import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { toWei } from '@/lib/eth'
import { asStringArray, catalogSearchToParams, type CatalogSearch } from '@/lib/catalog-search'
import { type Network } from '@/services/shared.types'
import { useNftListQuery } from '@/services/nfts/nfts.queries'

function toCents(value: string) {
  return Number(toWei(value) / 10n ** 16n)
}

export function useCatalogFilters() {
  const search = useSearch({ strict: false, shouldThrow: false }) as CatalogSearch
  const navigate = useNavigate()
  const listing = useNftListQuery(catalogSearchToParams(search))
  const facets = listing.data?.facets

  const bounds = useMemo<[number, number]>(() => {
    const min = facets ? toCents(facets.priceRange.minEth) : 2
    const max = facets ? toCents(facets.priceRange.maxEth) : 1230
    return [min, Math.max(min + 1, max)]
  }, [facets])

  const [range, setRange] = useState<[number, number]>(() => [
    search.minPrice ? toCents(search.minPrice) : bounds[0],
    search.maxPrice ? toCents(search.maxPrice) : bounds[1],
  ])

  function update(next: Partial<CatalogSearch>) {
    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        ...next,
        page: undefined,
        from: undefined,
      }),
    })
  }

  function toggle(list: string[] | undefined, id: string) {
    const current = list ?? []
    return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  }

  return {
    collections: facets?.collections ?? [],
    networks: facets?.networks ?? [],
    selectedCollections: asStringArray(search.collections) ?? [],
    selectedNetworks: (asStringArray(search.networks) ?? []) as Network[],
    range,
    bounds,
    onRangeChange: (value: number[]) => setRange([value[0], value[1]]),
    onApplyPrice: () =>
      update({
        minPrice: (range[0] / 100).toFixed(2),
        maxPrice: (range[1] / 100).toFixed(2),
      }),
    onToggleCollection: (id: string) => {
      const collections = toggle(search.collections, id)
      update({ collections: collections.length ? collections : undefined })
    },
    onToggleNetwork: (id: string) => {
      const networks = toggle(search.networks, id) as Network[]
      update({ networks: networks.length ? networks : undefined })
    },
    onClear: () =>
      update({
        q: undefined,
        collections: undefined,
        networks: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        tab: undefined,
        sort: undefined,
      }),
  }
}
