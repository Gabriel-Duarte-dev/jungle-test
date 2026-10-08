import { Trash2 } from 'lucide-react'

import { NftImage } from '@/components/artwork/NftImage'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatTokenId, shortEditionFromLabel } from '@/lib/nft-display'
import { formatEth } from '@/lib/eth'
import { type CartItem } from '@/services/cart/cart.types'

import { useCartLine } from './useCartLine'

interface CartLineProps {
  item: CartItem
  variant: 'table' | 'card'
}

export function CartLine({ item, variant }: CartLineProps) {
  const { onQuantity, onRemove, pending } = useCartLine(item)

  if (variant === 'table') {
    return (
      <tr className="h-h-17.5 bg-surface-card text-body text-text-primary">
        <td className="rounded-l-md py-2 pr-4 pl-3">
          <div className="flex items-center gap-4">
            <div className="size-h-17.5 bg-surface-dark shrink-0 overflow-hidden rounded-sm">
              <NftImage artwork={item.nft.artwork} width={160} height={160} sizes="70px" />
            </div>
            <div className="whitespace-nowrap">
              <h2 className="text-[16px] font-bold">{item.nft.name}</h2>
              <p className="text-caption text-text-secondary text-[16px]">
                ID do token {formatTokenId(item.nft.id)}
              </p>
              {item.priceChangedFromEth && (
                <p role="status" className="text-caption text-warning">
                  Preço atualizado de {item.priceChangedFromEth} ETH para {item.unitPriceEth} ETH.
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="text-secondary px-4 text-[16px]">
          {formatEth(item.unitPriceEth, { withSymbol: true })}
        </td>
        <td className="px-4">
          <QuantityStepper
            size="sm"
            variant="split"
            value={item.quantity}
            max={item.maxQuantity}
            onChange={onQuantity}
            disabled={pending || item.unavailable}
          />
        </td>
        <td className="text-text-accent px-4 text-[16px] font-bold">
          {formatEth(item.lineTotalEth, { withSymbol: true })}
        </td>
        <td className="rounded-r-md pr-3 pl-4 text-right">
          <RemoveButton onRemove={onRemove} disabled={pending} />
        </td>
      </tr>
    )
  }

  return (
    <article className="bg-surface-card flex h-25 gap-4 rounded-md">
      <div className="bg-surface-card size-25 shrink-0 overflow-hidden rounded-sm">
        <NftImage
          artwork={item.nft.artwork}
          width={100}
          height={100}
          sizes="100px"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 py-3 pr-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-body-lg text-text-primary font-bold">{item.nft.name}</h2>
            <p className="text-caption text-text-secondary mt-1">
              Edição: {shortEditionFromLabel(item.editionLabel)}
            </p>
          </div>
          <RemoveButton onRemove={onRemove} disabled={pending} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-body text-text-accent text-[16px] font-bold">
            {formatEth(item.unitPriceEth, { withSymbol: true })}
          </p>
          {item.priceChangedFromEth && (
            <p role="status" className="text-caption text-warning text-[16px]">
              Preço atualizado de {item.priceChangedFromEth} ETH para {item.unitPriceEth} ETH.
            </p>
          )}
          {item.unavailable && (
            <p role="status" className="text-caption text-danger text-[16px]">
              Esta edição esgotou e não entra no pedido.
            </p>
          )}
          <div className="mt-auto">
            <QuantityStepper
              size="sm"
              variant="split"
              value={item.quantity}
              max={item.maxQuantity}
              onChange={onQuantity}
              disabled={pending || item.unavailable}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function RemoveButton({ onRemove, disabled }: { onRemove: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label="Remover"
      className="text-text-secondary hover:text-danger grid size-8 place-items-center"
      onClick={onRemove}
      disabled={disabled}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  )
}
