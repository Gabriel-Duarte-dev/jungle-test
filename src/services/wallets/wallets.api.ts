import { httpClient } from '../http/axios'
import { type Wallet, type WalletPayload } from './wallets.types'

export async function fetchWallets(signal?: AbortSignal): Promise<Wallet[]> {
  const { data } = await httpClient.get<{ items: Wallet[] }>('/wallets', { signal })
  return data.items
}

export async function createWallet(payload: WalletPayload): Promise<Wallet> {
  const { data } = await httpClient.post<Wallet>('/wallets', payload)
  return data
}

export async function updateWallet(
  walletId: string,
  payload: Partial<WalletPayload>,
): Promise<Wallet> {
  const { data } = await httpClient.patch<Wallet>(
    `/wallets/${encodeURIComponent(walletId)}`,
    payload,
  )

  return data
}
