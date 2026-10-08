import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { clearAttempt, rememberAttemptOrder } from '@/lib/idempotency'

import { useOwnerKey } from '../auth/auth.queries'
import { queryKeys } from '../http/queryKeys'
import { createOrder, fetchOrder, fetchOrders } from './orders.api'
import { type CreateOrderPayload, type Order } from './orders.types'

export function useOrderQuery(orderId: string, options: { enabled?: boolean } = {}) {
  const owner = useOwnerKey()

  return useQuery({
    queryKey: queryKeys.orders.detail(owner, orderId),
    queryFn: ({ signal }) => fetchOrder(orderId, signal),
    enabled: (options.enabled ?? true) && Boolean(orderId),
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 4_000 : false),
  })
}

export function useOrdersQuery(options: { enabled?: boolean } = {}) {
  const owner = useOwnerKey()

  return useQuery({
    queryKey: queryKeys.orders.all(owner),
    queryFn: ({ signal }) => fetchOrders(signal),
    enabled: options.enabled ?? true,
  })
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: CreateOrderPayload
      idempotencyKey: string
    }) => createOrder(payload, idempotencyKey),

    onSuccess: (order: Order) => {
      rememberAttemptOrder(order.id)
      queryClient.setQueryData(queryKeys.orders.detail(owner, order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(owner) })
    },
  })
}

export function useFinalizeOrder() {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return (order: Order) => {
    if (order.status === 'pending') return

    clearAttempt()

    if (order.status === 'confirmed') {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
    }
  }
}
