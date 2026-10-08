import { type EthAmount } from '../shared.types'
import { type NftSummary } from '../nfts/nfts.types'

export interface CartItem {
  id: string
  nft: NftSummary
  editionId: string
  editionLabel: string
  quantity: number
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount

  maxQuantity: number

  priceChangedFromEth?: EthAmount
  unavailable: boolean
}

export interface Cart {
  id: string
  items: CartItem[]
  itemCount: number
  subtotalEth: EthAmount
  updatedAt: string
  version: number
}

export interface AddCartItemPayload {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemPayload {
  quantity: number
}
