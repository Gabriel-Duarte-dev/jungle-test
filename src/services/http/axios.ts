import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/lib/env'

import { ApiError, normalizeError } from './errors'
import { getAccessToken, getGuestId } from './session-store'

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['X-Guest-Id'] = getGuestId()

  return config
})

type SessionExpiredListener = () => void

const sessionExpiredListeners = new Set<SessionExpiredListener>()

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)
  return () => sessionExpiredListeners.delete(listener)
}

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalized = normalizeError(error)

    if (normalized.isSessionError) {
      for (const listener of sessionExpiredListeners) {
        listener()
      }
    }

    return Promise.reject(normalized)
  },
)

export { ApiError }
