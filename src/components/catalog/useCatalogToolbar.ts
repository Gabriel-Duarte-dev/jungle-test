import { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { type CatalogSearch } from '@/lib/catalog-search'
import { type NftSort, type NftTab } from '@/services/nfts/nfts.types'

export function useCatalogToolbar() {
  const search = useSearch({ strict: false, shouldThrow: false }) as CatalogSearch
  const navigate = useNavigate()
  const primed = useRef(false)

  const tab = search.tab ?? 'all'
  const sort = search.sort ?? 'recent'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      primed.current = true
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return {
    tab,
    sort,
    onTabChange: (next: NftTab) => {
      if (!primed.current || next === tab) return

      void navigate({
        to: '/',
        search: (previous) => ({
          ...previous,
          tab: next === 'all' ? undefined : next,
          page: undefined,
          from: undefined,
        }),
      })
    },
    onSortChange: (next: NftSort) => {
      if (!primed.current || next === sort) return

      void navigate({
        to: '/',
        search: (previous) => ({
          ...previous,
          sort: next === 'recent' ? undefined : next,
          page: undefined,
          from: undefined,
        }),
      })
    },
  }
}
