import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { SORT_LABELS, SORTS, TAB_LABELS, TABS } from '@/lib/catalog-search'
import { cn } from '@/lib/cn'
import { type NftSort } from '@/services/nfts/nfts.types'

import { useCatalogToolbar } from './useCatalogToolbar'

export function CatalogToolbar() {
  const { tab, sort, onTabChange, onSortChange } = useCatalogToolbar()

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div role="tablist" aria-label="Vitrine" className="flex flex-wrap items-end gap-3 lg:gap-6">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={cn(
              'text-body-md text-text-secondary hover:text-text-primary border-b-2 border-transparent pb-1 text-left font-medium transition-colors lg:min-w-[101px] lg:pb-2',
              tab === item && 'border-text-accent text-text-accent',
            )}
            onClick={() => onTabChange(item)}
          >
            {TAB_LABELS[item]}
          </button>
        ))}
      </div>

      <label className="text-caption text-text-secondary flex items-center gap-2">
        Ordenar por:
        <Select value={sort} onValueChange={(value) => onSortChange(value as NftSort)}>
          <SelectTrigger className="text-body text-text-primary h-9 w-55 border-0 bg-transparent px-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((item) => (
              <SelectItem key={item} value={item}>
                {SORT_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  )
}
