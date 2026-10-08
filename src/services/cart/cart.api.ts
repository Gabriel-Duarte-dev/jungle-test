import { httpClient } from '../http/axios'
import { type AddCartItemPayload, type Cart } from './cart.types'

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await httpClient.get<Cart>('/cart', { signal })
  return data
}

export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  const { data } = await httpClient.post<Cart>('/cart/items', payload)
  return data
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await httpClient.patch<Cart>(`/cart/items/${encodeURIComponent(itemId)}`, {
    quantity,
  })

  return data
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await httpClient.delete<Cart>(`/cart/items/${encodeURIComponent(itemId)}`)
  return data
}

export async function acknowledgeCartPrices(): Promise<Cart> {
  const { data } = await httpClient.post<Cart>('/cart/acknowledge')
  return data
}
