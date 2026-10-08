import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useNftDetailQuery } from '@/services/nfts/nfts.queries'
import { useAddToCartMutation } from '@/services/cart/cart.queries'
import { errorMessage } from '@/services/http/errors'

export function useNftPurchase() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const { data: nft } = useNftDetailQuery(nftId)
  const add = useAddToCartMutation()
  const firstAvailable = nft?.editions.find((edition) => edition.status === 'available')
  const [editionId, setEditionId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const resolvedEditionId = editionId ?? firstAvailable?.id ?? nft?.editions[0]?.id ?? ''
  const edition = nft?.editions.find((item) => item.id === resolvedEditionId) ?? firstAvailable
  const max = edition?.available ?? 0

  return {
    nft,
    editionId: resolvedEditionId,
    quantity: Math.min(quantity, Math.max(max, 1)),
    max,
    adding: add.isPending,
    canAdd: Boolean(edition && edition.status === 'available' && max > 0),
    onEditionChange: (id: string) => {
      setEditionId(id)
      setQuantity(1)
    },
    onQuantityChange: (value: number) => {
      if (!Number.isInteger(value)) return
      setQuantity(Math.min(Math.max(1, value), Math.max(max, 1)))
    },
    onAdd: () => {
      if (!nft || !edition) return

      add.mutate(
        { nftId: nft.id, editionId: edition.id, quantity: Math.min(quantity, max) },
        {
          onSuccess: () => toast.success('Adicionado ao carrinho.'),
          onError: (error) => toast.error(errorMessage(error)),
        },
      )
    },
  }
}
