import { type EthAmount, type Network, type Rarity } from '@/services/shared.types'
import { type EditionStatus, type NftAttribute, type NftCreator } from '@/services/nfts/nfts.types'
import { type Order } from '@/services/orders/orders.types'
import { type QuoteLine } from '@/services/quote/quote.types'
import { type Wallet } from '@/services/wallets/wallets.types'

export type OwnerKey = string

export interface DbEdition {
  id: string
  number: number
  totalInRun: number
  priceEth: EthAmount
  available: number
  status: EditionStatus
}

export interface DbNft {
  id: string
  name: string
  collectionId: string
  network: Network
  rarity: Rarity
  priceEth: EthAmount
  compareAtPriceEth: EthAmount | null
  artworkSlug: string
  gallerySlugs: string[]
  description: string
  creator: NftCreator
  attributes: NftAttribute[]
  editions: DbEdition[]
  mintedAt: string
  listedAt: string
  tokenStandard: string
  contractAddress: string
  royaltiesPct: number
  stats: { views: number; favorites: number; owners: number }
  popularity: number
  isNewRelease: boolean
  isTrending: boolean

  version: number
}

export interface DbCollection {
  id: string
  name: string
}

export interface DbUser {
  id: string
  name: string
  email: string
  handle: string

  passwordHash: string
  passwordSalt: string
  avatarUrl: string | null
  bio: string
  createdAt: string
}

export interface DbSession {
  token: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface DbCartItem {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedAt: string

  knownUnitPriceEth: EthAmount
}

export interface DbCart {
  id: string
  ownerKey: OwnerKey
  items: DbCartItem[]
  version: number
  updatedAt: string
}

export interface DbQuote {
  id: string
  ownerKey: OwnerKey
  lines: QuoteLine[]
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  couponCode: string | null
  network: Network
  signature: string
  issuedAt: string
  expiresAt: string
}

export interface DbOrder extends Order {
  ownerKey: OwnerKey
  userId: string

  settleAt: string | null

  purchased: Array<{ nftId: string; editionId: string; quantity: number }>
}

export interface DbWallet extends Wallet {
  userId: string
}

export interface DbCoupon {
  code: string
  label: string
  basisPoints: number

  expiresAt: string | null
  active: boolean
}

export interface DbFavorite {
  userId: string
  nftId: string
  createdAt: string
}

export interface DbIdempotencyRecord {
  key: string
  ownerKey: OwnerKey
  requestHash: string
  orderId: string
  createdAt: string
}

export interface MockDatabase {
  schemaVersion: number
  scenarioId: string
  collections: DbCollection[]
  nfts: DbNft[]
  users: DbUser[]
  sessions: DbSession[]
  carts: DbCart[]
  quotes: DbQuote[]
  orders: DbOrder[]
  wallets: DbWallet[]
  coupons: DbCoupon[]
  favorites: DbFavorite[]
  idempotency: DbIdempotencyRecord[]

  sequence: number
}

export const SCHEMA_VERSION = 4

export const NETWORK_FEES: Record<Network, EthAmount> = {
  ethereum: '0.0042',
  polygon: '0.0008',
  solana: '0.0003',
}
