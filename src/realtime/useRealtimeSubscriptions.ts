import { useEffect } from 'react'

import { useSocket } from './SocketProvider'

export function useNftSubscription(ids: string[]) {
  const { subscribeNfts, unsubscribeNfts } = useSocket()
  const key = ids.slice().sort().join(',')

  useEffect(() => {
    const list = key ? key.split(',') : []
    subscribeNfts(list)

    return () => unsubscribeNfts(list)
  }, [key, subscribeNfts, unsubscribeNfts])
}

export function useOrderSubscription(orderId: string | null) {
  const { subscribeOrders, unsubscribeOrders } = useSocket()

  useEffect(() => {
    if (!orderId) return

    subscribeOrders([orderId])

    return () => unsubscribeOrders([orderId])
  }, [orderId, subscribeOrders, unsubscribeOrders])
}
