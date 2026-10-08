import { socketHandlers } from '../socket'
import { authHandlers } from './auth.handlers'
import { cartHandlers } from './cart.handlers'
import { favoriteHandlers } from './favorites.handlers'
import { nftHandlers } from './nfts.handlers'
import { orderHandlers } from './orders.handlers'
import { profileHandlers } from './profile.handlers'
import { quoteHandlers } from './quote.handlers'
import { systemHandlers } from './system.handlers'
import { walletHandlers } from './wallets.handlers'

export const handlers = [
  ...systemHandlers,
  ...socketHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
]
