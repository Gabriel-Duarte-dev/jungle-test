import { httpClient } from '../http/axios'
import {
  type ChangePasswordPayload,
  type Profile,
  type UpdateAvatarPayload,
  type UpdateProfilePayload,
} from './profile.types'

export async function fetchProfile(signal?: AbortSignal): Promise<Profile> {
  const { data } = await httpClient.get<Profile>('/profile', { signal })
  return data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const { data } = await httpClient.patch<Profile>('/profile', payload)
  return data
}

export async function updateAvatar(payload: UpdateAvatarPayload): Promise<Profile> {
  const { data } = await httpClient.put<Profile>('/profile/avatar', payload)
  return data
}

export async function removeAvatar(): Promise<Profile> {
  const { data } = await httpClient.delete<Profile>('/profile/avatar')
  return data
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await httpClient.post('/profile/password', payload)
}
