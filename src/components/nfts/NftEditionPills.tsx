import { cn } from '@/lib/cn'
import { editionShortLabel } from '@/lib/nft-display'
import { type NftEdition } from '@/services/nfts/nfts.types'

interface NftEditionPillsProps {
  editions: NftEdition[]
  value: string
  onChange: (id: string) => void
}

export function NftEditionPills({ editions, value, onChange }: NftEditionPillsProps) {
  return (
    <fieldset>
      <legend className="text-body text-text-primary mb-2 font-bold lg:sr-only">Edição:</legend>
      <div className="flex flex-wrap gap-2">
        {editions.map((edition) => {
          const selected = edition.id === value
          const open = edition.status === 'available' && edition.available > 0

          return (
            <button
              key={edition.id}
              type="button"
              disabled={edition.status !== 'available'}
              onClick={() => onChange(edition.id)}
              className={cn(
                'text-caption inline-flex h-8 items-center gap-2 rounded-sm border px-3 font-bold',
                selected
                  ? 'border-primary bg-surface-card text-text-accent'
                  : 'border-border-soft text-text-secondary',
                edition.status !== 'available' && 'opacity-40',
              )}
            >
              {editionShortLabel(edition)}
              {selected && open && (
                <span className="bg-primary text-tiny text-ink rounded-sm px-1.5 py-0.5 font-bold tracking-wide">
                  ABERTA
                </span>
              )}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
