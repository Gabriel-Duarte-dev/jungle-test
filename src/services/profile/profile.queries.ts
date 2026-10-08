import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useOwnerKey, useSessionQuery } from '../auth/auth.queries'
import { queryKeys } from '../http/queryKeys'
import {
  changePassword,
  fetchProfile,
  removeAvatar,
  updateAvatar,
  updateProfile,
} from './profile.api'
import {
  type ChangePasswordPayload,
  type Profile,
  type UpdateAvatarPayload,
  type UpdateProfilePayload,
} from './profile.types'

export function useProfileQuery() {
  const owner = useOwnerKey()
  const { user } = useSessionQuery()

  return useQuery({
    queryKey: queryKeys.profile(owner),
    queryFn: ({ signal }) => fetchProfile(signal),
    enabled: Boolean(user),
  })
}

function useProfileMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Profile>) {
  const queryClient = useQueryClient()
  const owner = useOwnerKey()

  return useMutation({
    mutationFn,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile(owner), profile)
      void queryClient.invalidateQueries({ queryKey: queryKeys.session })
    },
  })
}

export function useUpdateProfileMutation() {
  return useProfileMutation((payload: UpdateProfilePayload) => updateProfile(payload))
}

export function useUpdateAvatarMutation() {
  return useProfileMutation((payload: UpdateAvatarPayload) => updateAvatar(payload))
}

export function useRemoveAvatarMutation() {
  return useProfileMutation(() => removeAvatar())
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  })
}
