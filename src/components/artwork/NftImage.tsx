import { type ArtworkRef } from '@/services/shared.types'
import { artworkFallback, artworkSrcSet } from '@/lib/artwork'
import { cn } from '@/lib/cn'

interface NftImageProps {
  artwork: ArtworkRef
  sizes: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function NftImage({ artwork, sizes, width, height, className, priority }: NftImageProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={artworkSrcSet(artwork.slug, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={artworkSrcSet(artwork.slug, 'webp')} sizes={sizes} />
      <img
        src={artworkFallback(artwork, width >= 450 ? 450 : 256)}
        alt={artwork.alt}
        width={width}
        height={height}
        sizes={sizes}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
        className={cn('h-full w-full object-cover', className)}
      />
    </picture>
  )
}
