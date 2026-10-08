import { MutationCache, QueryClient, QueryCache } from '@tanstack/react-query'

import { isApiError } from './errors'

const TRANSIENT_RETRY_LIMIT = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= TRANSIENT_RETRY_LIMIT) return false

  if (isApiError(error)) {
    if (error.status === undefined) return true
    return error.status >= 500 || error.status === 429
  }

  return false
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 4_000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
