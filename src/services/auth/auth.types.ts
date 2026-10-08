export interface User {
  id: string
  name: string
  email: string
  handle: string
  avatarUrl: string | null
  bio: string
  createdAt: string
}

export interface Session {
  user: User
  accessToken: string

  expiresAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}
