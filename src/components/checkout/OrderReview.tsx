import { type ReactNode, useState } from 'react'

import { NftImage } from '@/components/artwork/NftImage'
import { EthPrice } from '@/components/money/EthPrice'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { formatTokenId } from '@/lib/nft-display'
import { formatEth } from '@/lib/eth'
import { type CartItem } from '@/services/cart/cart.types'
import { type Quote } from '@/services/quote/quote.types'

interface OrderReviewProps {
  quote: Quote
  items: CartItem[]
  couponCode: string
  couponError?: string
  couponPending?: boolean
  onCouponCodeChange: (value: string) => void
  onApplyCoupon: () => void
  children?: ReactNode
}

export function OrderReview({
  quote,
  items,
  couponCode,
  couponError,
  couponPending,
  onCouponCodeChange,
  onApplyCoupon,
  children,
}: OrderReviewProps) {
  const [couponOpen, setCouponOpen] = useState(Boolean(couponCode || couponError))

  return (
    <section className="hidden lg:block">
      <h2 className="text-heading text-text-primary font-bold">Seus NFTs</h2>
      <div className="text-caption text-text-secondary border-primary/20 mt-4 flex justify-between border-b pb-3">
        <span className="text-text-primary">NFTs</span>
        <span className="text-text-primary">Subtotal</span>
      </div>
      <ul className="mt-3 flex flex-col gap-4">
        {quote.lines.map((line) => {
          const item = items.find((candidate) => candidate.nft.id === line.nftId)

          return (
            <li
              key={`${line.nftId}-${line.editionId}`}
              className="bg-surface-card flex h-17.5 items-center gap-3 pr-3"
            >
              {item && (
                <div className="bg-surface-card size-17.5 shrink-0 overflow-hidden rounded-sm">
                  <NftImage
                    artwork={item.nft.artwork}
                    width={160}
                    height={160}
                    sizes="70px"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-body text-text-primary truncate font-bold">{line.nftName}</p>
                <p className="text-caption text-text-secondary">
                  ID do token: {item ? formatTokenId(item.nft.id) : ''}
                  <span className="ml-2">(× {line.quantity})</span>
                </p>
              </div>
              <span className="text-body text-text-accent font-bold">
                {formatEth(line.lineTotalEth, { withSymbol: true })}
              </span>
            </li>
          )
        })}
      </ul>

      {couponOpen ? (
        <form
          className="mt-6 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            onApplyCoupon()
          }}
        >
          <Field label="Cupom" labelHidden error={couponError} className="min-w-0 flex-1">
            {(control) => (
              <Input
                {...control}
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value)}
                placeholder="Digite o código promocional..."
                autoComplete="off"
              />
            )}
          </Field>
          <Button type="submit" loading={couponPending}>
            Aplicar
          </Button>
        </form>
      ) : (
        <button
          type="button"
          className="text-caption text-text-secondary hover:text-text-accent mt-6 w-full text-center"
          onClick={() => setCouponOpen(true)}
        >
          Tem um código promocional? Aplique aqui
        </button>
      )}

      <dl className="text-body text-text-secondary mt-6 flex flex-col gap-2">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatEth(quote.subtotalEth, { withSymbol: true })}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Desconto do lançamento</dt>
          <dd>(-) {formatEth(quote.discountEth)}</dd>
        </div>
        <div>
          <div className="flex justify-between">
            <dt>Taxa de rede</dt>
            <dd>{formatEth(quote.networkFeeEth, { withSymbol: true })}</dd>
          </div>
          <p className="text-caption text-text-secondary mt-1 text-center">Taxa estimada</p>
        </div>
      </dl>
      <div className="mt-4 flex justify-between">
        <span className="text-body-lg text-text-primary font-bold">Total</span>
        <EthPrice value={quote.totalEth} className="text-body-lg" />
      </div>
      {children && <div className="mt-8 flex flex-col gap-4">{children}</div>}
    </section>
  )
}
