import { type ArtworkRef } from '@/services/shared.types'

export const ARTWORK_WIDTHS = [160, 256, 450, 900] as const

export type ArtworkWidth = (typeof ARTWORK_WIDTHS)[number]

export function artworkUrl(slug: string, width: ArtworkWidth, format: 'avif' | 'webp') {
  return `/assets/nft/${slug}-${width}.${format}`
}

export function artworkSrcSet(slug: string, format: 'avif' | 'webp') {
  return ARTWORK_WIDTHS.map((width) => `${artworkUrl(slug, width, format)} ${width}w`).join(', ')
}

export function artworkFallback(artwork: ArtworkRef, width: ArtworkWidth = 450) {
  return artworkUrl(artwork.slug, width, 'webp')
}
