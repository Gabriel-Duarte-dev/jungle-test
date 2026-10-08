import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { EthPrice } from '@/components/money/EthPrice'

import { useNftPurchase } from './useNftPurchase'

export function NftBuyBar() {
  const { nft, quantity, max, adding, onQuantityChange, onAdd, canAdd } = useNftPurchase()

  if (!nft) return null

  return (
    <div className="bg-surface-card fixed inset-x-0 bottom-0 z-20 rounded-t-[50px] px-6 pt-5 pb-8.5 shadow-[0px_0px_20px_0px_rgba(10,6,4,0.45)] lg:hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-[16px]">Qtd.</span>
          <QuantityStepper
            size="sm"
            variant="split"
            value={quantity}
            max={Math.max(max, 1)}
            onChange={onQuantityChange}
            disabled={!canAdd}
          />
        </div>
        <EthPrice value={nft.priceEth} className="text-body-lg" />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          loading={adding}
          disabled={!canAdd}
          className="flex-1 rounded-full"
        >
          {canAdd ? 'Comprar NFT' : 'Edição indisponível'}
        </Button>
        <Link
          to="/carrinho"
          aria-label="Ir para o carrinho"
          className="border-border bg-surface-raised text-secondary grid size-15 shrink-0 place-items-center rounded-full border"
        >
          <ShoppingCart aria-hidden className="size-5" />
        </Link>
      </div>
    </div>
  )
}
