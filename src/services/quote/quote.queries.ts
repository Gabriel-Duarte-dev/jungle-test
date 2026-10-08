import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useOwnerKey } from '../auth/auth.queries'
import { queryKeys } from '../http/queryKeys'
import { type Network } from '../shared.types'
import { createQuote } from './quote.api'
import { type Quote } from './quote.types'

export function useQuoteQuery(input: {
  couponCode: string | null
  network: Network
  enabled: boolean
}) {
  const owner = useOwnerKey()

  return useQuery({
    queryKey: queryKeys.quote(owner, input.couponCode, input.network),
    queryFn: ({ signal }) =>
      createQuote({ couponCode: input.couponCode, network: input.network }, signal),
    enabled: input.enabled,

    staleTime: 0,
    gcTime: 0,
    retry: false,
  })
}

export function useRefreshQuoteMutation() {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn: ({ couponCode, network }: { couponCode: string | null; network: Network }) =>
      createQuote({ couponCode, network }),
    onSuccess: (quote: Quote, { couponCode, network }) => {
      queryClient.setQueryData(queryKeys.quote(owner, couponCode, network), quote)
    },
  })
}
