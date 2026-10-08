export type EndpointKey =
  | 'nfts.list'
  | 'nfts.detail'
  | 'nfts.featured'
  | 'auth.login'
  | 'auth.register'
  | 'auth.session'
  | 'favorites.list'
  | 'favorites.toggle'
  | 'cart.get'
  | 'cart.mutate'
  | 'quote.create'
  | 'orders.create'
  | 'orders.get'
  | 'profile.get'
  | 'profile.update'
  | 'profile.password'
  | 'wallets.list'
  | 'wallets.mutate'

export interface LiveNftChange {
  nftId: string
  editionId?: string
  priceEth?: string

  soldOut?: boolean
  delayMs: number
}

export interface Scenario {
  id: string
  label: string
  description: string

  latency: [min: number, max: number]

  outOfOrder: boolean

  offline: boolean
  forcedErrors: Partial<Record<EndpointKey, number>>

  sessionExpired: boolean

  orderTimeout: boolean
  paymentOutcome: 'confirmed' | 'refused'

  paymentDelayMs: number

  liveChanges: LiveNftChange[]

  duplicateEvents: boolean

  emptyCatalog: boolean

  favoritesFail: boolean

  registerConflict: boolean
}
