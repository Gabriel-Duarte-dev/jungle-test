import { Mail } from 'lucide-react'

import { useLiveRegion } from '@/components/a11y/LiveRegion'

const CHANNELS = [
  { id: 'linkedin', label: 'LinkedIn', glyph: 'in' },
  { id: 'email', label: 'e-mail', glyph: null },
  { id: 'x', label: 'X', glyph: '𝕏' },
] as const

export function NftShare() {
  const { announce } = useLiveRegion()

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <p className="text-body text-text-primary font-bold">Compartilhar este NFT:</p>
      <div className="flex gap-3">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            type="button"
            aria-label={`Compartilhar no ${channel.label}`}
            className="border-border-soft text-text-secondary hover:text-text-accent grid size-9 place-items-center rounded-full border"
            onClick={() =>
              announce(`Compartilhar no ${channel.label} está fora do escopo desta entrega.`)
            }
          >
            {channel.id === 'email' ? (
              <Mail aria-hidden className="size-4" />
            ) : (
              <span aria-hidden className="text-caption font-bold">
                {channel.glyph}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
