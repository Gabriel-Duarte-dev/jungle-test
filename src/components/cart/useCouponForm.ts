import { type FormEvent, useState } from 'react'

import { isApiError } from '@/services/http/errors'
import { useQuote } from './useQuoteContext'

export function useCouponForm() {
  const { couponCode, setCouponCode, quote, error, isFetching } = useQuote()
  const [code, setCode] = useState(couponCode ?? '')

  return {
    code,
    applied: Boolean(quote?.coupon),
    error: isApiError(error) ? (error.fields?.couponCode ?? error.message) : undefined,
    pending: isFetching,
    onCodeChange: setCode,
    onSubmit: (event: FormEvent) => {
      event.preventDefault()
      setCouponCode(code.trim() || null)
    },
    onClear: () => {
      setCode('')
      setCouponCode(null)
    },
  }
}
