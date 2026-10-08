import { httpClient } from '../http/axios'
import { type CreateOrderPayload, type Order } from './orders.types'

export async function createOrder(
  payload: CreateOrderPayload,
  idempotencyKey: string,
): Promise<Order> {
  const { data } = await httpClient.post<Order>('/orders', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },

    timeout: 20_000,
  })

  return data
}

export async function fetchOrder(orderId: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await httpClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`, { signal })
  return data
}

export async function fetchOrders(signal?: AbortSignal): Promise<Order[]> {
  const { data } = await httpClient.get<{ items: Order[] }>('/orders', { signal })
  return data.items
}
