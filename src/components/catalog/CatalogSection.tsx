import { useNavigate, useSearch } from '@tanstack/react-router'

import { catalogSearchToParams, type CatalogSearch } from '@/lib/catalog-search'
import { PAGE } from '@/lib/layout'
import { useNftListQuery } from '@/services/nfts/nfts.queries'
import { useNftSubscription } from '@/realtime/useRealtimeSubscriptions'
import { useIsDesktop } from '@/hooks/useMediaQuery'

import { CatalogFilters } from './CatalogFilters'
import { CatalogGrid } from './CatalogGrid'
import { CatalogPagination } from './CatalogPagination'
import { CatalogToolbar } from './CatalogToolbar'
import { FeaturedBanner } from '@/components/home/FeaturedBanner'

export function CatalogSection() {
  const search = useSearch({ strict: false, shouldThrow: false }) as CatalogSearch
  const navigate = useNavigate()
  const listing = useNftListQuery(catalogSearchToParams(search))
  const desktop = useIsDesktop()

  useNftSubscription(listing.data?.items.map((item) => item.id) ?? [])

  const page = search.page ?? 1
  const totalPages = listing.data?.totalPages ?? 1

  function onPageChange(next: number) {
    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        page: next === 1 ? undefined : next,
        from: undefined,
      }),
    })
  }

  function onClear() {
    void navigate({ to: '/', search: { scenario: search.scenario } })
  }

  return (
    <section id="catalogo" className={`${PAGE} flex flex-col gap-6 py-6 lg:gap-12 lg:py-8`}>
      <h2 className="text-heading text-text-primary hidden font-bold lg:block">Mercado</h2>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        {desktop && (
          <div className="flex w-[310px] shrink-0 flex-col gap-6">
            <CatalogFilters />
            <FeaturedBanner />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <CatalogToolbar />
          <div className="mt-8">
            <CatalogGrid
              items={listing.data?.items ?? []}
              isLoading={listing.isLoading}
              isError={listing.isError}
              error={listing.error}
              isFetching={listing.isFetching}
              onRetry={() => void listing.refetch()}
              onClear={onClear}
            />
          </div>
          <CatalogPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  )
}
