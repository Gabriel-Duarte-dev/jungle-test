import { Link } from '@tanstack/react-router'

import { CollectorForm } from '@/components/checkout/CollectorForm'
import { WalletPicker } from '@/components/checkout/WalletPicker'
import { OrderReview } from '@/components/checkout/OrderReview'
import { useCheckout } from '@/components/checkout/useCheckout'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/EmptyState'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ScreenBackBar } from '@/components/layout/ScreenBackBar'
import { CartSkeleton } from '@/components/nfts/NftSkeletons'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PAGE, PAGE_NARROW } from '@/lib/layout'
import { useNftSubscription } from '@/realtime/useRealtimeSubscriptions'

export function CheckoutPage() {
  useDocumentTitle('Pagamento — KURIO')
  const checkout = useCheckout()

  useNftSubscription(checkout.cart.data?.items.map((item) => item.nft.id) ?? [])

  if (checkout.status === 'loading' || checkout.cart.isLoading || checkout.wallets.isLoading) {
    return (
      <div className={`${PAGE} py-10`}>
        <CartSkeleton />
      </div>
    )
  }

  if (checkout.status !== 'authenticated') {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <EmptyState
          title="Entre para finalizar"
          description="O pagamento exige uma sessão ativa. Seu carrinho será recuperado depois do login."
          actionLabel="Entrar"
          onAction={() => {
            window.location.href = '/entrar?from=/pagamento'
          }}
        />
      </div>
    )
  }

  if (!checkout.cart.data?.items.length) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <EmptyState
          title="Carrinho vazio"
          description="Adicione NFTs antes de ir ao pagamento."
          actionLabel="Ir ao catálogo"
          onAction={() => {
            window.location.href = '/#catalogo'
          }}
        />
      </div>
    )
  }

  if (checkout.quoteQuery.isError && !checkout.couponError) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <ErrorState
          error={checkout.quoteQuery.error}
          onRetry={() => void checkout.quoteQuery.refetch()}
        />
      </div>
    )
  }

  const confirm = (
    <Button
      type="button"
      onClick={() => {
        checkout.acknowledge()
        void checkout.onConfirm()
      }}
      loading={checkout.submitting}
      disabled={checkout.connection !== 'connected' || !checkout.quote}
      className="w-full max-lg:h-12 max-lg:rounded-full"
    >
      Confirmar compra
    </Button>
  )

  function walletPicker(mode: 'mobile' | 'desktop') {
    if (!checkout.wallets.data?.length) {
      return (
        <p className="text-body text-text-secondary">
          Cadastre uma carteira em <Link to="/carteiras">Carteiras</Link> para continuar.
        </p>
      )
    }

    return (
      <WalletPicker
        wallets={checkout.wallets.data}
        walletId={checkout.walletId}
        network={checkout.network}
        connection={checkout.connection}
        onWallet={checkout.setWalletId}
        onNetwork={checkout.setNetwork}
        onConnect={() => checkout.setConnection('connected')}
        mode={mode}
        totalEth={checkout.quote?.totalEth}
      />
    )
  }

  return (
    <>
      <ScreenBackBar title="Pagamento com carteira" to="/carrinho" />
      <div
        className={`${PAGE} grid gap-10 pb-32 lg:grid-cols-[minmax(0,1.7fr)_minmax(22rem,1fr)] lg:items-start lg:pb-10`}
      >
        <div className="hidden flex-col gap-6 lg:flex">
          <Breadcrumb
            items={[
              { label: 'Início', to: '/' },
              { label: 'Mercado', to: '/', hash: 'catalogo' },
              { label: 'Pagamento' },
            ]}
          />
          <h2 className="text-heading text-text-primary font-bold">Perfil do colecionador</h2>
          <CollectorForm
            defaultValues={checkout.collector}
            username={checkout.user?.handle}
            onChange={checkout.setCollector}
            errors={checkout.fieldErrors}
          />
        </div>

        <div className="flex flex-col gap-6 pt-2 lg:pt-16">
          {checkout.quote ? (
            <OrderReview
              quote={checkout.quote}
              items={checkout.cart.data.items}
              couponCode={checkout.couponDraft}
              couponError={checkout.couponError}
              couponPending={checkout.quoteQuery.isFetching}
              onCouponCodeChange={checkout.setCouponDraft}
              onApplyCoupon={checkout.applyCoupon}
            >
              {checkout.stale && (
                <p role="status" className="text-caption text-warning">
                  Os valores mudaram. Confira o novo resumo e confirme novamente.
                </p>
              )}
              {walletPicker('desktop')}
              {confirm}
            </OrderReview>
          ) : (
            <p className="text-body text-text-secondary hidden lg:block">Calculando cotação…</p>
          )}
          <div className="lg:hidden">{walletPicker('mobile')}</div>
        </div>
      </div>
      <div className="bg-ink fixed inset-x-0 bottom-0 z-20 px-6 py-5 lg:hidden">{confirm}</div>
    </>
  )
}
