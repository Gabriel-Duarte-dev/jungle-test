import { type ArtworkRef, type EthAmount, type Network } from '../shared.types'
import { type AppliedCoupon } from '../quote/quote.types'

export type OrderStatus = 'pending' | 'confirmed' | 'refused'

export interface OrderCollector {
  fullName: string
  email: string
  document?: string
  phone?: string
}

export interface OrderWallet {
  id: string
  label: string
  address: string
  network: Network
  provider: string
}

export interface OrderItem {
  nftId: string
  nftName: string
  collectionName: string
  artwork: ArtworkRef
  editionId: string
  editionLabel: string
  quantity: number
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount
}

export interface OrderTotals {
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
}

export interface OrderTransaction {
  hash: string
  explorerUrl: string
  network: Network
  confirmedAt: string
}

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  version: number
  createdAt: string
  updatedAt: string
  collector: OrderCollector
  wallet: OrderWallet
  items: OrderItem[]
  totals: OrderTotals
  coupon: AppliedCoupon | null

  transaction: OrderTransaction | null
  refusalReason: string | null
}

export interface CreateOrderPayload {
  quoteId: string
  quoteSignature: string
  walletId: string
  network: Network
  collector: OrderCollector
}
