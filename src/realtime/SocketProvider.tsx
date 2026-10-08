import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { formatEth } from '@/lib/eth'
import { useOwnerKey, useSessionQuery } from '@/services/auth/auth.queries'
import { getGuestId } from '@/services/http/session-store'
import { queryKeys } from '@/services/http/queryKeys'
import { clearAttempt } from '@/lib/idempotency'

import { applyNftUpdated, applyOrderUpdated } from './cachePatchers'
import { SOCKET_EVENTS } from './events.types'
import { createSocket, type AppSocket } from './socket'
import { VersionRegistry } from './versionRegistry'

const socket = createSocket()
const registry = new VersionRegistry()

interface SocketContextValue {
  socket: AppSocket
  subscribeNfts: (ids: string[]) => void
  unsubscribeNfts: (ids: string[]) => void
  subscribeOrders: (ids: string[]) => void
  unsubscribeOrders: (ids: string[]) => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { user, status } = useSessionQuery()
  const owner = useOwnerKey()
  const { announce } = useLiveRegion()
  const ownerRef = useRef(owner)

  useEffect(() => {
    ownerRef.current = owner
  }, [owner])

  useEffect(() => {
    function identify() {
      socket.emit('identify', {
        userId: user?.id ?? null,
        guestId: getGuestId(),
      })
    }

    function onNftUpdated(...args: unknown[]) {
      const event = args[0] as Parameters<typeof applyNftUpdated>[1]
      if (!registry.shouldApply(event)) return

      applyNftUpdated(queryClient, event)
      announce(
        `Preço ou disponibilidade de um NFT foi atualizado para ${formatEth(event.data.priceEth, { withSymbol: true })}.`,
      )
    }

    function onOrderUpdated(...args: unknown[]) {
      const event = args[0] as Parameters<typeof applyOrderUpdated>[1]
      if (!registry.shouldApply(event)) return

      applyOrderUpdated(queryClient, event, ownerRef.current)

      if (event.data.status === 'confirmed') {
        clearAttempt()
        announce('Pagamento confirmado.')
      } else if (event.data.status === 'refused') {
        clearAttempt()
        announce('Pagamento recusado.')
      } else {
        announce('Status do pedido atualizado.')
      }
    }

    function onReconnect() {
      identify()
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart(ownerRef.current) })
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(ownerRef.current) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
    }

    function onConnect() {
      window.__KURIO_SOCKET_CONNECTED__ = true
      identify()
    }

    function onDisconnect() {
      window.__KURIO_SOCKET_CONNECTED__ = false
    }

    socket.on(SOCKET_EVENTS.nftUpdated, onNftUpdated)
    socket.on(SOCKET_EVENTS.orderUpdated, onOrderUpdated)
    socket.io.on('reconnect', onReconnect)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.connect()

    return () => {
      socket.off(SOCKET_EVENTS.nftUpdated, onNftUpdated)
      socket.off(SOCKET_EVENTS.orderUpdated, onOrderUpdated)
      socket.io.off('reconnect', onReconnect)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [announce, queryClient, user?.id])

  useEffect(() => {
    if (status === 'anonymous' || status === 'expired') {
      registry.reset()
    }

    if (socket.connected) {
      socket.emit('identify', {
        userId: user?.id ?? null,
        guestId: getGuestId(),
      })
    }
  }, [status, user?.id])

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      subscribeNfts: (ids) => {
        if (ids.length) socket.emit('subscribe', { nftIds: ids })
      },
      unsubscribeNfts: (ids) => {
        if (ids.length) socket.emit('unsubscribe', { nftIds: ids })
      },
      subscribeOrders: (ids) => {
        if (ids.length) socket.emit('subscribe', { orderIds: ids })
      },
      unsubscribeOrders: (ids) => {
        if (ids.length) socket.emit('unsubscribe', { orderIds: ids })
      },
    }),
    [],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const value = useContext(SocketContext)

  if (!value) {
    throw new Error('useSocket must be used within SocketProvider')
  }

  return value
}
