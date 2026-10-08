import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/artwork/NftImage'
import { EthPrice } from '@/components/money/EthPrice'
import { RARITY_LABELS } from '@/services/shared.types'
import { type NftSummary } from '@/services/nfts/nfts.types'

import { FavoriteButton } from './FavoriteButton'

interface NftCardProps {
  nft: NftSummary
}

export function NftCard({ nft }: NftCardProps) {
  const showRarity = nft.rarity === 'raro'

  return (
    <article className="flex w-full min-w-0 flex-col gap-2 lg:gap-3">
      <div className="bg-surface-card relative aspect-square w-full overflow-hidden rounded-lg lg:aspect-auto lg:h-75 lg:rounded-sm">
        {showRarity && (
          <span className="bg-primary text-caption-lg text-ink absolute top-3 left-0 z-10 rounded-r-sm px-2 py-1 font-bold tracking-wide uppercase lg:hidden">
            {RARITY_LABELS[nft.rarity]}
          </span>
        )}
        <FavoriteButton
          nftId={nft.id}
          favorited={nft.isFavorite}
          className="absolute top-3 right-3 z-10 size-7 lg:size-9"
        />
        <Link
          to="/nfts/$nftId"
          params={{ nftId: nft.id }}
          className="absolute inset-1 overflow-hidden rounded-lg lg:inset-x-1 lg:top-7.75 lg:bottom-auto lg:size-62.5"
        >
          <NftImage
            artwork={nft.artwork}
            width={256}
            height={256}
            sizes="(min-width: 1440px) 258px, (min-width: 768px) 30vw, 45vw"
          />
        </Link>
      </div>
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="flex min-w-0 flex-col gap-0.5 px-2 lg:gap-3 lg:px-0"
      >
        <h3 className="text-body-lg text-foreground truncate">{nft.name}</h3>
        <EthPrice
          value={nft.priceEth}
          compareAt={nft.compareAtPriceEth}
          className="text-body lg:text-subtitle"
        />
      </Link>
    </article>
  )
}
