import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useSessionQuery } from '@/services/auth/auth.queries'
import { useCartQuery } from '@/services/cart/cart.queries'
import { useQuoteQuery, useRefreshQuoteMutation } from '@/services/quote/quote.queries'
import { useWalletsQuery } from '@/services/wallets/wallets.queries'
import { useCreateOrderMutation } from '@/services/orders/orders.queries'
import { type OrderCollector } from '@/services/orders/orders.types'
import { type Network } from '@/services/shared.types'
import { getOrCreateAttempt, readAttempt } from '@/lib/idempotency'
import { isApiError, errorMessage } from '@/services/http/errors'

export function useCheckout() {
  const navigate = useNavigate()
  const { user, status } = useSessionQuery()
  const cart = useCartQuery()
  const wallets = useWalletsQuery()
  const createOrder = useCreateOrderMutation()
  const refreshQuote = useRefreshQuoteMutation()

  const [couponDraft, setCouponDraft] = useState('')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [network, setNetwork] = useState<Network>('ethereum')
  const [walletId, setWalletId] = useState('')
  const [connection, setConnection] = useState<'idle' | 'connected' | 'refused' | 'disconnected'>(
    'idle',
  )
  const [collector, setCollector] = useState<OrderCollector>({
    fullName: '',
    email: '',
    document: '',
    phone: '',
  })
  const [acknowledgedSignature, setAcknowledgedSignature] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const quoteQuery = useQuoteQuery({
    couponCode,
    network,
    enabled: status === 'authenticated' && (cart.data?.items.length ?? 0) > 0,
  })

  useEffect(() => {
    const existing = readAttempt()
    if (existing?.orderId) {
      void navigate({ to: '/pedidos/$orderId', params: { orderId: existing.orderId } })
    }
  }, [navigate])

  const primary = wallets.data?.find((wallet) => wallet.kind === 'primary') ?? wallets.data?.[0]
  const resolvedWalletId = walletId || primary?.id || ''
  const resolvedNetwork = network
  const selectedWalletId = walletId

  const resolvedCollector: OrderCollector = {
    fullName: collector.fullName || user?.name || '',
    email: collector.email || user?.email || '',
    document: collector.document ?? '',
    phone: collector.phone ?? '',
  }
  const quote = quoteQuery.data
  const stale = Boolean(quote && acknowledgedSignature && acknowledgedSignature !== quote.signature)

  async function onConfirm() {
    if (!quote || connection !== 'connected' || submitting) return

    if (stale) {
      setAcknowledgedSignature(quote.signature)
      toast.message('Os valores mudaram. Confira o novo resumo e confirme novamente.')
      return
    }

    setSubmitting(true)
    setFieldErrors({})

    const latest = await refreshQuote.mutateAsync({ couponCode, network }).catch((error) => {
      toast.error(errorMessage(error))
      setSubmitting(false)
      return null
    })

    if (!latest) return

    if (latest.signature !== quote.signature) {
      setAcknowledgedSignature(null)
      toast.message('A cotação foi atualizada. Revise os valores antes de confirmar.')
      setSubmitting(false)
      return
    }

    const attempt = getOrCreateAttempt(latest.signature)
    const payload = {
      quoteId: latest.id,
      quoteSignature: latest.signature,
      walletId: resolvedWalletId,
      network: resolvedNetwork,
      collector: resolvedCollector,
    }

    try {
      const order = await createOrder.mutateAsync({ payload, idempotencyKey: attempt.key })
      void navigate({ to: '/pedidos/$orderId', params: { orderId: order.id } })
    } catch (error) {
      if (isApiError(error) && (error.code === 'timeout' || error.code === 'network_error')) {
        try {
          const order = await createOrder.mutateAsync({ payload, idempotencyKey: attempt.key })
          void navigate({ to: '/pedidos/$orderId', params: { orderId: order.id } })
          return
        } catch (retryError) {
          toast.error(errorMessage(retryError))
        }
      } else if (isApiError(error) && error.fields) {
        setFieldErrors(error.fields)
        toast.error(error.message)
      } else if (isApiError(error) && error.code === 'quote_stale') {
        setAcknowledgedSignature(null)
        toast.error(error.message)
      } else {
        toast.error(errorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    status,
    user,
    cart,
    wallets,
    quote,
    quoteQuery,
    collector: resolvedCollector,
    setCollector,
    walletId: selectedWalletId,
    setWalletId,
    network,
    setNetwork,
    connection,
    setConnection,
    stale,
    fieldErrors,
    couponDraft,
    setCouponDraft,
    applyCoupon: () => setCouponCode(couponDraft.trim() || null),
    couponError: isApiError(quoteQuery.error)
      ? (quoteQuery.error.fields?.couponCode ?? quoteQuery.error.message)
      : undefined,
    submitting: submitting || createOrder.isPending,
    onConfirm,
    acknowledge: () => quote && setAcknowledgedSignature(quote.signature),
  }
}
