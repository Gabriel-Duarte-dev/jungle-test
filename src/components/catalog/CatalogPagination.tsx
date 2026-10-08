import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const pages = visiblePages(page, totalPages)

  return (
    <nav aria-label="Paginação do catálogo" className="mt-12 flex items-center justify-end gap-2">
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          aria-current={item === page ? 'page' : undefined}
          className={
            item === page
              ? 'bg-primary text-caption text-ink grid size-[35px] place-items-center rounded-xs font-bold'
              : 'border-border text-caption text-text-secondary grid size-[35px] place-items-center rounded-xs border'
          }
        >
          {item}
        </button>
      ))}
      {page < totalPages && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </Button>
      )}
    </nav>
  )
}

function visiblePages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
}
