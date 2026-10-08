import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/Button'
import { EthPrice } from '@/components/money/EthPrice'
import { formatEth } from '@/lib/eth'
import { isApiError } from '@/services/http/errors'

import { CouponForm } from './CouponForm'
import { useQuote } from './useQuoteContext'

export function CartSummary({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { quote, isFetching, isError, error } = useQuote()
  const quoteError = isApiError(error) ? error.message : null

  return (
    <aside className="flex flex-col gap-4 rounded-md">
      {variant === 'desktop' && (
        <h2 className="text-text-primary border-primary/20 border-b pb-3 text-[16px] font-bold">
          Resumo da carteira
        </h2>
      )}
      <CouponForm variant={variant} />
      {quote ? (
        <>
          <Row
            label="Subtotal"
            value={formatEth(quote.subtotalEth, { decimals: 2, withSymbol: true })}
          />
          <Row
            label="Desconto do lançamento"
            value={`(-) ${formatEth(quote.discountEth, { decimals: 2 })}`}
          />
          <div className="text-body text-text-primary flex items-start justify-between">
            <span>Taxa de rede</span>
            <span className="text-right">
              {formatEth(quote.networkFeeEth, { decimals: 2, withSymbol: true })}
              <span className="text-caption text-primary mt-1 block">Taxa estimada</span>
            </span>
          </div>
          <div className="lg:border-border flex items-center justify-between lg:border-t lg:pt-3">
            <span className="text-body-lg font-bold">Total</span>
            <EthPrice value={quote.totalEth} className="text-body-lg" />
          </div>
          {quote.warnings.map((warning) => (
            <p
              key={`${warning.code}-${warning.editionId}`}
              role="status"
              className="text-caption text-warning"
            >
              {warning.message}
            </p>
          ))}
        </>
      ) : (
        <p className="text-body text-text-secondary">
          {isFetching ? 'Calculando cotação…' : 'Adicione itens para ver o resumo.'}
        </p>
      )}
      {isError && quoteError && (
        <p role="alert" className="text-caption text-danger">
          {quoteError}
        </p>
      )}
      {variant === 'desktop' && (
        <>
          <Button asChild>
            <Link to="/pagamento">Conectar e finalizar</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/" hash="catalogo">
              Continuar explorando
            </Link>
          </Button>
        </>
      )}
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-body text-text-primary flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
