import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { isApiError } from '../http/errors'
import { queryKeys } from '../http/queryKeys'
import { getAccessToken, getGuestId, rotateGuestId, setAccessToken } from '../http/session-store'
import { fetchSession, login, logout, register } from './auth.api'
import { type LoginPayload, type RegisterPayload, type Session } from './auth.types'

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'expired'

export function useSessionQuery() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: getAccessToken() !== null,
    retry: false,
    staleTime: 60_000,
  })

  const status: SessionStatus = (() => {
    if (getAccessToken() === null) return 'anonymous'
    if (query.isPending) return 'loading'
    if (query.data) return 'authenticated'
    if (isApiError(query.error) && query.error.code === 'session_expired') return 'expired'
    return 'anonymous'
  })()

  return { ...query, status, user: query.data?.user ?? null }
}

export function useOwnerKey(): string {
  const { user } = useSessionQuery()
  return user ? `user:${user.id}` : `guest:${getGuestId()}`
}

function useSessionEstablished() {
  const queryClient = useQueryClient()

  return async (session: Session) => {
    setAccessToken(session.accessToken)
    queryClient.setQueryData(queryKeys.session, session)

    await queryClient.invalidateQueries({ queryKey: ['cart'] })
    await queryClient.invalidateQueries({ queryKey: ['favorites'] })
    await queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
  }
}

export function useLoginMutation() {
  const onEstablished = useSessionEstablished()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: onEstablished,
  })
}

export function useRegisterMutation() {
  const onEstablished = useSessionEstablished()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: onEstablished,
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      setAccessToken(null)
      rotateGuestId()
      queryClient.clear()
    },
  })
}
