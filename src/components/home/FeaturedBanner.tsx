import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/artwork/NftImage'
import { Skeleton } from '@/components/ui/Skeleton'
import { useFeaturedQuery } from '@/services/nfts/nfts.queries'

export function FeaturedBanner() {
  const { data, isLoading } = useFeaturedQuery()
  const offer = data?.limitedOffer

  if (isLoading || !offer) {
    return <Skeleton className="h-[470px] w-full rounded-md" />
  }

  return (
    <Link
      to="/nfts/$nftId"
      params={{ nftId: offer.id }}
      className="flex h-[470px] flex-col overflow-hidden rounded-md bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_10%,transparent),color-mix(in_srgb,var(--color-primary)_3%,transparent))] pt-6"
    >
      <p className="text-heading text-text-accent px-5 font-bold">NFT EM DESTAQUE</p>
      <p className="text-title text-text-primary mt-4 px-5">OFERTA LIMITADA</p>
      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl">
        <NftImage
          artwork={offer.artwork}
          width={310}
          height={368}
          sizes="310px"
          className="h-full"
        />
      </div>
    </Link>
  )
}
