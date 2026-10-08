import { Skeleton, SkeletonRegion } from '@/components/ui/Skeleton'
import { PAGE } from '@/lib/layout'

export function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface-card relative h-75 w-full">
        <Skeleton className="absolute top-[31px] left-1 size-[250px] rounded-lg" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-24" />
    </div>
  )
}

export function CatalogGridSkeleton() {
  return (
    <SkeletonRegion
      label="Carregando catálogo"
      className="grid grid-cols-2 gap-x-4 gap-y-6 xl:grid-cols-3 xl:gap-x-6 xl:gap-y-18"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <NftCardSkeleton key={index} />
      ))}
    </SkeletonRegion>
  )
}

export function DetailSkeleton() {
  return (
    <SkeletonRegion label="Carregando NFT" className={`${PAGE} grid gap-10 py-10 lg:grid-cols-2`}>
      <Skeleton className="aspect-square w-full rounded-3xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </SkeletonRegion>
  )
}

export function CartSkeleton() {
  return (
    <SkeletonRegion
      label="Carregando carrinho"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-md" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-md" />
    </SkeletonRegion>
  )
}
