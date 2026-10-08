import {
  type NftUpdatedEvent,
  type OrderUpdatedEvent,
  SOCKET_EVENTS,
} from '@/realtime/events.types'

import { getDb } from '../db'
import { type DbNft, type DbOrder } from '../db/schema'
import { getScenario } from '../scenarios'

export type SocketEvent =
  | { name: typeof SOCKET_EVENTS.nftUpdated; payload: NftUpdatedEvent }
  | { name: typeof SOCKET_EVENTS.orderUpdated; payload: OrderUpdatedEvent }

type Broadcaster = (event: SocketEvent) => void

const broadcasters = new Set<Broadcaster>()

export function registerBroadcaster(broadcaster: Broadcaster): () => void {
  broadcasters.add(broadcaster)
  return () => broadcasters.delete(broadcaster)
}

let eventCounter = 0

function nextEventId(): string {
  eventCounter += 1
  return `evt-${eventCounter.toString(36)}-${Date.now().toString(36)}`
}

function broadcast(event: SocketEvent): void {
  for (const broadcaster of broadcasters) {
    broadcaster(event)
  }

  if (getScenario().duplicateEvents) {
    for (const broadcaster of broadcasters) {
      broadcaster(event)
      broadcaster({
        name: event.name,
        payload: {
          ...event.payload,
          eventId: nextEventId(),
          version: Math.max(1, event.payload.version - 1),
        },
      } as SocketEvent)
    }
  }
}

export function buildNftUpdatedEvent(nft: DbNft): NftUpdatedEvent {
  return {
    eventId: nextEventId(),
    resource: 'nft',
    resourceId: nft.id,
    version: nft.version,
    emittedAt: new Date().toISOString(),
    data: {
      priceEth: nft.priceEth,
      compareAtPriceEth: nft.compareAtPriceEth,
      available: nft.editions.reduce((total, edition) => total + edition.available, 0),
      editions: nft.editions.map((edition) => ({
        id: edition.id,
        priceEth: edition.priceEth,
        available: edition.available,
        status: edition.status,
      })),
    },
  }
}

export function buildOrderUpdatedEvent(order: DbOrder): OrderUpdatedEvent {
  return {
    eventId: nextEventId(),
    resource: 'order',
    resourceId: order.id,
    version: order.version,
    emittedAt: new Date().toISOString(),
    data: {
      status: order.status,
      transaction: order.transaction,
      refusalReason: order.refusalReason,
    },
  }
}

export function emitNftUpdated(nftId: string): void {
  const nft = getDb().nfts.find((candidate) => candidate.id === nftId)
  if (!nft) return

  broadcast({ name: SOCKET_EVENTS.nftUpdated, payload: buildNftUpdatedEvent(nft) })
}

export function emitOrderUpdated(order: DbOrder): void {
  broadcast({ name: SOCKET_EVENTS.orderUpdated, payload: buildOrderUpdatedEvent(order) })
}

export function hasConnectedClients(): boolean {
  return broadcasters.size > 0
}
