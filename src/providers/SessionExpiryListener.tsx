import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { onSessionExpired } from '@/services/http/axios'
import { queryKeys } from '@/services/http/queryKeys'
import { setAccessToken } from '@/services/http/session-store'
import { useSessionQuery } from '@/services/auth/auth.queries'
import { useLiveRegion } from '@/components/a11y/LiveRegion'

export function SessionExpiryListener() {
  const queryClient = useQueryClient()
  const { status } = useSessionQuery()
  const { announce } = useLiveRegion()

  useEffect(() => {
    return onSessionExpired(() => {
      setAccessToken(null)
      queryClient.removeQueries({ queryKey: queryKeys.session })
      queryClient.removeQueries({ queryKey: ['profile'] })
      queryClient.removeQueries({ queryKey: ['wallets'] })
      queryClient.removeQueries({ queryKey: ['orders'] })
      queryClient.removeQueries({ queryKey: ['favorites'] })
      announce('Sua sessão expirou. Entre novamente para continuar.')
    })
  }, [announce, queryClient])

  if (status !== 'expired') return null

  return (
    <div role="alert" className="shell-padding bg-danger/15 text-body text-danger py-3 text-center">
      Sua sessão expirou. Entre novamente para retomar o que estava fazendo.
    </div>
  )
}
