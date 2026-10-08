import { useParams } from '@tanstack/react-router'

import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/EmptyState'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { NftBuyBar } from '@/components/nfts/NftBuyBar'
import { NftDetailTabs } from '@/components/nfts/NftDetailTabs'
import { NftGallery } from '@/components/nfts/NftGallery'
import { NftMobileHero } from '@/components/nfts/NftMobileHero'
import { NftPurchasePanel } from '@/components/nfts/NftPurchasePanel'
import { RelatedGrid } from '@/components/nfts/RelatedGrid'
import { DetailSkeleton } from '@/components/nfts/NftSkeletons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PAGE, PAGE_NARROW } from '@/lib/layout'
import { useNftDetailQuery } from '@/services/nfts/nfts.queries'
import { useNftSubscription } from '@/realtime/useRealtimeSubscriptions'
import { isApiError } from '@/services/http/errors'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const query = useNftDetailQuery(nftId)

  useNftSubscription(query.data ? [query.data.id] : [])
  useDocumentTitle(query.data ? `${query.data.name} — KURIO` : 'NFT — KURIO')

  if (query.isLoading) return <DetailSkeleton />

  if (query.isError && isApiError(query.error) && query.error.code === 'not_found') {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <EmptyState
          title="NFT não encontrado"
          description="Este item não existe ou saiu do catálogo. Volte ao mercado para continuar explorando."
          actionLabel="Ir ao catálogo"
          onAction={() => {
            window.location.href = '/#catalogo'
          }}
        />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  if (!query.data) return null

  const nft = query.data

  return (
    <div className="bg-surface-card min-h-dvh lg:min-h-0 lg:bg-transparent">
      <NftMobileHero images={nft.gallery} nftId={nft.id} favorited={nft.isFavorite} />
      <article
        className={`${PAGE} overflow-hidden rounded-t-[50px] pb-40 shadow-[0px_0px_20px_0px_rgba(10,6,4,0.45)] lg:pb-10`}
      >
        <Breadcrumb
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/', hash: 'catalogo' },
            { label: nft.name },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
          <NftGallery images={nft.gallery} />
          <NftPurchasePanel />
        </div>
        <NftDetailTabs nft={nft} />
      </article>
      <RelatedGrid />
      <NftBuyBar />
    </div>
  )
}
