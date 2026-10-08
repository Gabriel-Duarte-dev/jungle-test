import { useParams } from '@tanstack/react-router'

import { PAGE } from '@/lib/layout'
import { useRelatedNftsQuery } from '@/services/nfts/nfts.queries'

import { RelatedRail } from './RelatedRail'

export function RelatedGrid() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const { data } = useRelatedNftsQuery(nftId)

  if (!data?.length) return null

  return (
    <div className={`hidden lg:block ${PAGE}`}>
      <RelatedRail title="Mais desta coleção" items={data} />
    </div>
  )
}
