import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { NftImage } from '@/components/artwork/NftImage'
import { FavoriteButton } from '@/components/nfts/FavoriteButton'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { type ArtworkRef } from '@/services/shared.types'

interface NftMobileHeroProps {
  images: ArtworkRef[]
  nftId: string
  favorited: boolean
}

export function NftMobileHero({ images, nftId, favorited }: NftMobileHeroProps) {
  const desktop = useIsDesktop()
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  if (!current) return null

  return (
    <div className="px-6 pt-6 lg:hidden">
      <div className="bg-surface-raised relative overflow-hidden rounded-3xl">
        <div className="aspect-square">
          <NftImage artwork={current} width={450} height={450} sizes="100vw" priority />
        </div>
        <Link
          to="/"
          hash="catalogo"
          aria-label="Voltar"
          className="bg-ink/70 text-foreground absolute top-4 left-4 grid size-10 place-items-center rounded-full"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </Link>
        <FavoriteButton
          nftId={nftId}
          favorited={favorited}
          data-testid={desktop ? undefined : 'favorite-main'}
          className="absolute top-4 right-4"
        />
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={`${image.slug}-${index}`}
                type="button"
                aria-label={`Imagem ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  'size-2 rounded-full',
                  index === active ? 'bg-text-accent' : 'bg-foreground/40',
                )}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
