import { Heart, Star } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { EthPrice } from '@/components/money/EthPrice'
import { useIsDesktop } from '@/hooks/useMediaQuery'

import { NftEditionPills } from './NftEditionPills'
import { NftMeta } from './NftMeta'
import { NftShare } from './NftShare'
import { NftStars } from './NftStars'
import { useFavoriteButton } from './useFavoriteButton'
import { useNftPurchase } from './useNftPurchase'

export function NftPurchasePanel() {
  const desktop = useIsDesktop()
  const {
    nft,
    editionId,
    quantity,
    max,
    adding,
    onEditionChange,
    onQuantityChange,
    onAdd,
    canAdd,
  } = useNftPurchase()

  if (!nft) return null

  return (
    <div className="bg-surface-card lg:bg-ink relative z-10 flex flex-col gap-5 pt-5 lg:px-0 lg:pt-0">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-heading text-text-primary font-bold">{nft.name}</h1>
          {!desktop && (
            <span
              className="bg-surface-dark text-caption text-text-accent inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1"
              aria-label="Avaliação 4.8 de 5, 19 avaliações"
            >
              <Star aria-hidden className="size-3.5 fill-current" />
              4.8 (19)
            </span>
          )}
        </div>
        {desktop && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <EthPrice
              value={nft.priceEth}
              compareAt={nft.compareAtPriceEth}
              className="text-title"
            />
            <NftStars />
            <span className="text-caption text-text-secondary">
              19 avaliações de colecionadores
            </span>
          </div>
        )}
      </div>

      <div>
        {desktop && <p className="text-body text-text-primary mb-2 font-bold">Sobre este NFT:</p>}
        <p className="text-body text-text-secondary leading-6">{nft.description}</p>
      </div>

      <NftEditionPills editions={nft.editions} value={editionId} onChange={onEditionChange} />

      <div className="hidden items-center gap-3 lg:flex lg:justify-between">
        <QuantityStepper
          variant="split"
          value={quantity}
          max={Math.max(max, 1)}
          onChange={onQuantityChange}
          disabled={!canAdd}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onAdd}
            loading={adding}
            disabled={!canAdd}
            className="min-w-36"
          >
            {canAdd ? 'COMPRAR' : 'Edição indisponível'}
          </Button>
          {desktop && <FavoriteLabel nftId={nft.id} favorited={nft.isFavorite} />}
        </div>
      </div>

      <NftMeta nft={nft} />
      <NftShare />
    </div>
  )
}

function FavoriteLabel({ nftId, favorited }: { nftId: string; favorited: boolean }) {
  const { onToggle, pending } = useFavoriteButton(nftId, favorited)

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      data-testid="favorite-main"
    >
      <Heart aria-hidden className={favorited ? 'size-4 fill-current' : 'size-4'} />
      {favorited ? 'Favoritado' : 'Favoritar'}
    </Button>
  )
}
