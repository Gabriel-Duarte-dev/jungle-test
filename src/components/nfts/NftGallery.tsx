import { useState } from 'react'
import { Search } from 'lucide-react'

import { NftImage } from '@/components/artwork/NftImage'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { type ArtworkRef } from '@/services/shared.types'
import { cn } from '@/lib/cn'

interface NftGalleryProps {
  images: ArtworkRef[]
}

export function NftGallery({ images }: NftGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const current = images[active] ?? images[0]

  if (!current) return null

  return (
    <div className="hidden min-w-0 items-start gap-4 lg:flex">
      {images.length > 1 && (
        <ul className="flex w-25 flex-col gap-4" aria-label="Galeria">
          {images.map((image, index) => (
            <li key={`${image.slug}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                className={cn(
                  'size-25 overflow-hidden rounded-md border border-transparent',
                  index === active && 'border-primary',
                )}
              >
                <NftImage artwork={image} width={160} height={160} sizes="100px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="bg-surface-card relative size-112 overflow-hidden rounded-sm">
        <NftImage artwork={current} width={450} height={450} sizes="448px" priority />
        <button
          type="button"
          className="bg-ink/70 text-foreground absolute right-3 bottom-3 grid size-10 place-items-center rounded-sm"
          aria-label="Ampliar arte"
          onClick={() => setZoomed(true)}
        >
          <Search aria-hidden className="size-5" />
        </button>
      </div>

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="w-[min(100%-2rem,36rem)] p-3">
          <DialogTitle className="sr-only">Arte em destaque</DialogTitle>
          <DialogDescription className="sr-only">
            Visualização ampliada da arte. O zoom real está fora do escopo desta entrega.
          </DialogDescription>
          <div className="aspect-square overflow-hidden rounded-sm">
            <NftImage artwork={current} width={900} height={900} sizes="560px" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
