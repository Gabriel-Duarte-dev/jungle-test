import { Heart } from 'lucide-react'

import { cn } from '@/lib/cn'

import { useFavoriteButton } from './useFavoriteButton'

interface FavoriteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  nftId: string
  favorited: boolean
}

export function FavoriteButton({ nftId, favorited, className, ...props }: FavoriteButtonProps) {
  const { onToggle, pending } = useFavoriteButton(nftId, favorited)

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'bg-ink/70 text-text-secondary hover:text-text-accent grid size-9 place-items-center rounded-full',
        favorited && 'text-text-accent',
        className,
      )}
      {...props}
    >
      <Heart aria-hidden className={cn('size-4', favorited && 'fill-current')} />
    </button>
  )
}
