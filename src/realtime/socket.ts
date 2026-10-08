import { io, type Socket } from 'socket.io-client'

import { type ClientToServerEvents, type ServerToClientEvents } from './events.types'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function createSocket(): AppSocket {
  return io({
    transports: ['websocket'],
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4_000,
  })
}
