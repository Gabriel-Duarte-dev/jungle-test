import { Star } from 'lucide-react'

import { cn } from '@/lib/cn'

export function NftStars({ className }: { className?: string }) {
  return (
    <span className={cn('text-text-accent inline-flex items-center gap-1', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className="size-3.5 fill-current" />
      ))}
    </span>
  )
}
