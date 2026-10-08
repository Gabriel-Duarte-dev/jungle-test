import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/artwork/NftImage'
import { EthPrice } from '@/components/money/EthPrice'
import { cn } from '@/lib/cn'
import { type NftSummary } from '@/services/nfts/nfts.types'

interface RelatedRailProps {
  title: string
  items: NftSummary[]
}

const PAGE_SIZE = 5

export function RelatedRail({ title, items }: RelatedRailProps) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const slice = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  if (!items.length) return null

  return (
    <section className="py-12">
      <h2 className="text-heading text-text-primary mb-8 font-bold">{title}</h2>
      <ul className="grid grid-cols-5 gap-6">
        {slice.map((nft) => (
          <li key={nft.id}>
            <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="flex flex-col gap-3">
              <div className="bg-surface-card h-[212px] overflow-hidden rounded-sm">
                <NftImage artwork={nft.artwork} width={256} height={256} sizes="212px" />
              </div>
              <h3 className="text-body-lg text-foreground truncate">{nft.name}</h3>
              <EthPrice value={nft.priceEth} className="text-body" />
            </Link>
          </li>
        ))}
      </ul>
      <div
        className="mt-8 flex justify-center gap-2"
        role="tablist"
        aria-label="Páginas da vitrine"
      >
        {Array.from({ length: Math.max(pages, 3) }, (_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === page}
            aria-label={`Página ${index + 1}`}
            className={cn(
              'size-2 rounded-full',
              index === page ? 'bg-text-accent' : 'bg-border-soft',
            )}
            onClick={() => setPage(Math.min(index, pages - 1))}
          />
        ))}
      </div>
    </section>
  )
}
