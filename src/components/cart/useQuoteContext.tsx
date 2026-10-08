import { createContext, useContext, useState, type ReactNode } from 'react'

import { useCartQuery } from '@/services/cart/cart.queries'
import { useQuoteQuery } from '@/services/quote/quote.queries'
import { type Network } from '@/services/shared.types'
import { type Quote } from '@/services/quote/quote.types'

interface QuoteContextValue {
  couponCode: string | null
  setCouponCode: (value: string | null) => void
  network: Network
  setNetwork: (value: Network) => void
  quote: Quote | undefined
  error: unknown
  isFetching: boolean
  isError: boolean
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const cart = useCartQuery()
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [network, setNetwork] = useState<Network>('ethereum')
  const query = useQuoteQuery({
    couponCode,
    network,
    enabled: (cart.data?.items.length ?? 0) > 0,
  })

  return (
    <QuoteContext.Provider
      value={{
        couponCode,
        setCouponCode,
        network,
        setNetwork,
        quote: query.data,
        error: query.error,
        isFetching: query.isFetching,
        isError: query.isError,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  const value = useContext(QuoteContext)

  if (!value) {
    throw new Error('useQuote must be used within QuoteProvider')
  }

  return value
}
