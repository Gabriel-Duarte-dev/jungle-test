import { NftCard } from '@/components/nfts/NftCard'
import { CatalogGridSkeleton } from '@/components/nfts/NftSkeletons'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/EmptyState'
import { type NftSummary } from '@/services/nfts/nfts.types'

interface CatalogGridProps {
  items: NftSummary[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onClear: () => void
  isFetching: boolean
}

export function CatalogGrid({
  items,
  isLoading,
  isError,
  error,
  onRetry,
  onClear,
  isFetching,
}: CatalogGridProps) {
  if (isLoading) return <CatalogGridSkeleton />

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Nenhum NFT encontrado"
        description="Ajuste a busca ou os filtros para ver outras peças do catálogo."
        actionLabel="Limpar filtros"
        onAction={onClear}
      />
    )
  }

  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-6 xl:grid-cols-3 xl:gap-x-6 xl:gap-y-18"
      aria-busy={isFetching || undefined}
    >
      {items.map((nft) => (
        <NftCard key={nft.id} nft={nft} />
      ))}
    </div>
  )
}
