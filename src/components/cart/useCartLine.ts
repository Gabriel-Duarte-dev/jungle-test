import { toast } from 'sonner'

import { type CartItem } from '@/services/cart/cart.types'
import { useRemoveCartItemMutation, useUpdateCartItemMutation } from '@/services/cart/cart.queries'
import { errorMessage } from '@/services/http/errors'

export function useCartLine(item: CartItem) {
  const update = useUpdateCartItemMutation()
  const remove = useRemoveCartItemMutation()

  return {
    pending: update.isPending || remove.isPending,
    onQuantity: (quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return
      update.mutate(
        { itemId: item.id, quantity },
        { onError: (error) => toast.error(errorMessage(error)) },
      )
    },
    onRemove: () => {
      remove.mutate({ itemId: item.id }, { onError: (error) => toast.error(errorMessage(error)) })
    },
  }
}
