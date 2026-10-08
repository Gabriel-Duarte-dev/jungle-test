import { type User } from '../auth/auth.types'

export type Profile = User

export interface UpdateProfilePayload {
  name: string
  handle: string
  email: string
  bio: string
}

export interface UpdateAvatarPayload {
  dataUrl: string
  fileName: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
