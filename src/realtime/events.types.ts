import { type EthAmount } from '@/services/shared.types'
import { type EditionStatus } from '@/services/nfts/nfts.types'
import { type OrderStatus, type OrderTransaction } from '@/services/orders/orders.types'

export const SOCKET_EVENTS = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const

interface SocketEventEnvelope<TResource extends string, TData> {
  eventId: string
  resource: TResource
  resourceId: string
  version: number
  emittedAt: string
  data: TData
}

export interface NftUpdatedPayload {
  priceEth: EthAmount
  compareAtPriceEth: EthAmount | null
  available: number
  editions: Array<{
    id: string
    priceEth: EthAmount
    available: number
    status: EditionStatus
  }>
}

export type NftUpdatedEvent = SocketEventEnvelope<'nft', NftUpdatedPayload>

export interface OrderUpdatedPayload {
  status: OrderStatus
  transaction: OrderTransaction | null
  refusalReason: string | null
}

export type OrderUpdatedEvent = SocketEventEnvelope<'order', OrderUpdatedPayload>

export interface ServerToClientEvents {
  [SOCKET_EVENTS.nftUpdated]: (event: NftUpdatedEvent) => void
  [SOCKET_EVENTS.orderUpdated]: (event: OrderUpdatedEvent) => void
}

export interface ClientToServerEvents {
  identify: (payload: { userId: string | null; guestId: string }) => void

  subscribe: (payload: { nftIds?: string[]; orderIds?: string[] }) => void
  unsubscribe: (payload: { nftIds?: string[]; orderIds?: string[] }) => void
}
