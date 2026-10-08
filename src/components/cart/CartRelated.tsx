import { PAGE } from '@/lib/layout'
import { useNftListQuery, useRelatedNftsQuery } from '@/services/nfts/nfts.queries'
import { RelatedRail } from '@/components/nfts/RelatedRail'

export function CartRelated({ nftId }: { nftId?: string }) {
  const related = useRelatedNftsQuery(nftId ?? '')
  const listing = useNftListQuery({ sort: 'recent', page: 1, perPage: 5 })
  const items = related.data?.length ? related.data : (listing.data?.items ?? [])

  if (!items.length) return null

  return (
    <div className={`hidden lg:block ${PAGE}`}>
      <RelatedRail title="Colecionadores também viram" items={items} />
    </div>
  )
}
