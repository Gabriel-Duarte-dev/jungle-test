import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useOwnerKey } from '../auth/auth.queries'
import { queryKeys } from '../http/queryKeys'
import {
  acknowledgeCartPrices,
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from './cart.api'
import { type AddCartItemPayload, type Cart } from './cart.types'

export function useCartQuery() {
  const owner = useOwnerKey()

  return useQuery({
    queryKey: queryKeys.cart(owner),
    queryFn: ({ signal }) => fetchCart(signal),
  })
}

function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(owner), cart)
      void queryClient.invalidateQueries({ queryKey: ['quote', owner] })
    },
  })
}

export function useAddToCartMutation() {
  return useCartMutation((payload: AddCartItemPayload) => addCartItem(payload))
}

export function useUpdateCartItemMutation() {
  return useCartMutation(({ itemId, quantity }: { itemId: string; quantity: number }) =>
    updateCartItem(itemId, quantity),
  )
}

export function useRemoveCartItemMutation() {
  return useCartMutation(({ itemId }: { itemId: string }) => removeCartItem(itemId))
}

export function useAcknowledgeCartPricesMutation() {
  return useCartMutation(() => acknowledgeCartPrices())
}
