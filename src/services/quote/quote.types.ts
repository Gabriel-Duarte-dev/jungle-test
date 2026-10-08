import { type EthAmount } from '../shared.types'

export interface AppliedCoupon {
  code: string
  label: string

  basisPoints: number
}

export type QuoteWarningCode = 'price_changed' | 'quantity_reduced' | 'item_unavailable'

export interface QuoteWarning {
  code: QuoteWarningCode
  nftId: string
  editionId: string
  message: string
  previousValue?: string
  currentValue?: string
}

export interface QuoteLine {
  nftId: string
  nftName: string
  editionId: string
  editionLabel: string
  quantity: number
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount
}

export interface Quote {
  id: string
  lines: QuoteLine[]
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  coupon: AppliedCoupon | null
  warnings: QuoteWarning[]
  issuedAt: string
  expiresAt: string
  signature: string
}

export interface QuotePayload {
  couponCode?: string | null
}
