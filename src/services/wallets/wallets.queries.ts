import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useOwnerKey, useSessionQuery } from '../auth/auth.queries'
import { queryKeys } from '../http/queryKeys'
import { createWallet, fetchWallets, updateWallet } from './wallets.api'
import { type Wallet, type WalletPayload } from './wallets.types'

export function useWalletsQuery() {
  const owner = useOwnerKey()
  const { user } = useSessionQuery()

  return useQuery({
    queryKey: queryKeys.wallets(owner),
    queryFn: ({ signal }) => fetchWallets(signal),
    enabled: Boolean(user),
  })
}

function useWalletMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Wallet>) {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets(owner) })
    },
  })
}

export function useCreateWalletMutation() {
  return useWalletMutation((payload: WalletPayload) => createWallet(payload))
}

export function useUpdateWalletMutation() {
  return useWalletMutation(
    ({ walletId, payload }: { walletId: string; payload: Partial<WalletPayload> }) =>
      updateWallet(walletId, payload),
  )
}
