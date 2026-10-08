import { type Network } from '../shared.types'

export type WalletKind = 'primary' | 'secondary'

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase'

export const WALLET_PROVIDER_LABELS: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

export interface WalletProfile {
  displayName: string
  profileName: string
  referral: string
  email: string
  ens: string
  ensTld: '.eth' | '.xyz' | '.crypto'
  optionalEns: string
}

export interface Wallet extends WalletProfile {
  id: string
  label: string
  address: string
  network: Network
  kind: WalletKind
  provider: WalletProvider
  createdAt: string
}

export interface WalletPayload extends WalletProfile {
  label: string
  address: string
  network: Network
  kind: WalletKind
  provider: WalletProvider
}
