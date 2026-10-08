import { httpClient } from '../http/axios'
import { type LoginPayload, type RegisterPayload, type Session } from './auth.types'

export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  const { data } = await httpClient.get<Session>('/auth/session', { signal })
  return data
}

export async function login(payload: LoginPayload): Promise<Session> {
  const { data } = await httpClient.post<Session>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<Session> {
  const { data } = await httpClient.post<Session>('/auth/register', payload)
  return data
}

export async function logout(): Promise<void> {
  await httpClient.post('/auth/logout')
}
