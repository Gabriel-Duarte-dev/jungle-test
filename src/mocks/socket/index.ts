import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import { SOCKET_EVENTS } from '@/realtime/events.types'

import { applyLiveChange } from '../db/operations/catalog'
import { getScenario } from '../scenarios'
import { registerBroadcaster } from './emitter'

const socketLink = ws.link(/.*/)

export const socketHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    const scenario = getScenario()

    const subscription = {
      userId: null as string | null,
      guestId: 'anonymous',
      nftIds: new Set<string>(),
      orderIds: new Set<string>(),
    }

    const timers: Array<ReturnType<typeof setTimeout>> = []

    io.client.on('identify', (_event, payload: { userId: string | null; guestId: string }) => {
      subscription.userId = payload?.userId ?? null
      subscription.guestId = payload?.guestId ?? 'anonymous'
    })

    io.client.on('subscribe', (_event, payload: { nftIds?: string[]; orderIds?: string[] }) => {
      payload?.nftIds?.forEach((id) => subscription.nftIds.add(id))
      payload?.orderIds?.forEach((id) => subscription.orderIds.add(id))
    })

    io.client.on('unsubscribe', (_event, payload: { nftIds?: string[]; orderIds?: string[] }) => {
      payload?.nftIds?.forEach((id) => subscription.nftIds.delete(id))
      payload?.orderIds?.forEach((id) => subscription.orderIds.delete(id))
    })

    const unregister = registerBroadcaster((event) => {
      if (event.name === SOCKET_EVENTS.nftUpdated) {
        io.client.emit(SOCKET_EVENTS.nftUpdated, event.payload)
        return
      }

      if (subscription.orderIds.has(event.payload.resourceId)) {
        io.client.emit(SOCKET_EVENTS.orderUpdated, event.payload)
      }
    })

    for (const change of scenario.liveChanges) {
      timers.push(setTimeout(() => applyLiveChange(change), change.delayMs))
    }

    connection.client.addEventListener('close', () => {
      unregister()
      timers.forEach(clearTimeout)
      subscription.nftIds.clear()
      subscription.orderIds.clear()
    })
  }),
]
