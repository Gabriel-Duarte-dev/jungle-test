import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

interface ScreenBackBarProps {
  title: string
  to?: string
  hash?: string
}

export function ScreenBackBar({ title, to = '/', hash }: ScreenBackBarProps) {
  return (
    <div className="flex items-center gap-3 px-6 pt-10 pb-4 lg:hidden">
      <Link
        to={to}
        hash={hash}
        aria-label="Voltar"
        className="text-foreground grid size-10 place-items-center"
      >
        <ChevronLeft aria-hidden className="size-6" />
      </Link>
      <h1 className="text-body-xl text-text-primary font-bold">{title}</h1>
    </div>
  )
}
