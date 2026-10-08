import { Link } from '@tanstack/react-router'

import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/EmptyState'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ScreenBackBar } from '@/components/layout/ScreenBackBar'
import { CartSkeleton } from '@/components/nfts/NftSkeletons'
import { CartLine } from '@/components/cart/CartLine'
import { CartRelated } from '@/components/cart/CartRelated'
import { CartSummary } from '@/components/cart/CartSummary'
import { QuoteProvider } from '@/components/cart/useQuoteContext'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { PAGE, PAGE_NARROW } from '@/lib/layout'
import { useCartQuery, useAcknowledgeCartPricesMutation } from '@/services/cart/cart.queries'
import { useNftSubscription } from '@/realtime/useRealtimeSubscriptions'

export function CartPage() {
  useDocumentTitle('Carrinho — KURIO')
  const desktop = useIsDesktop()
  const cart = useCartQuery()
  const ack = useAcknowledgeCartPricesMutation()

  useNftSubscription(cart.data?.items.map((item) => item.nft.id) ?? [])

  if (cart.isLoading) {
    return (
      <div className={`${PAGE} py-10`}>
        <CartSkeleton />
      </div>
    )
  }

  if (cart.isError) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <ErrorState error={cart.error} onRetry={() => void cart.refetch()} />
      </div>
    )
  }

  const items = cart.data?.items ?? []
  const changed = items.some((item) => item.priceChangedFromEth)

  if (!items.length) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <EmptyState
          title="Seu carrinho está vazio"
          description="Explore o mercado e adicione edições disponíveis."
          actionLabel="Explorar catálogo"
          onAction={() => {
            window.location.href = '/#catalogo'
          }}
        />
      </div>
    )
  }

  return (
    <QuoteProvider>
      <ScreenBackBar title="Carrinho de NFTs" to="/" hash="catalogo" />
      <div className={`${PAGE} py-0 pb-112 lg:pb-10`}>
        <Breadcrumb
          items={[
            { label: 'Início', to: '/' },
            { label: 'Mercado', to: '/', hash: 'catalogo' },
            { label: 'Carrinho' },
          ]}
        />
        {changed && (
          <div
            role="status"
            className="border-warning/40 text-caption text-warning mb-4 rounded-sm border p-3"
          >
            Alguns preços mudaram enquanto o carrinho estava aberto.
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-2"
              onClick={() => ack.mutate()}
            >
              Entendi
            </Button>
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-4">
          {desktop ? (
            <table className="w-full border-separate border-spacing-y-2.5">
              <thead>
                <tr className="text-caption text-text-primary text-left font-bold tracking-wide uppercase">
                  <th className="border-primary/20 w-[42%] border-b pb-4">NFTs</th>
                  <th className="border-primary/20 border-b pb-4">Preço</th>
                  <th className="border-primary/20 border-b pb-4">Edições</th>
                  <th className="border-primary/20 border-b pb-4">Total</th>
                  <th className="border-primary/20 w-12 border-b pb-4">
                    <span className="sr-only">Remover</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <CartLine key={item.id} item={item} variant="table" />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <CartLine key={item.id} item={item} variant="card" />
              ))}
            </div>
          )}
        </div>

        {desktop && <CartSummary />}
        </div>
      </div>

      {desktop && <CartRelated nftId={items[0]?.nft.id} />}

      {!desktop && (
        <div className="border-border bg-surface-card fixed inset-x-0 bottom-0 z-20 rounded-t-[50px] border-t px-6 py-6 shadow-[0px_0px_20px_0px_rgba(10,6,4,0.45)] lg:bg-none">
          <CartSummary variant="mobile" />
          <Button asChild className="text-ink mt-8 h-15 w-full rounded-full text-[16px]">
            <Link to="/pagamento">Conectar e finalizar</Link>
          </Button>
        </div>
      )}
    </QuoteProvider>
  )
}
