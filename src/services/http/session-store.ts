import { readString, removeKey, writeString } from '@/lib/storage'

const TOKEN_KEY = 'kurio.session.token'
const GUEST_KEY = 'kurio.guest.id'

type SessionListener = (token: string | null) => void

let token: string | null = readString(TOKEN_KEY)
const listeners = new Set<SessionListener>()

export function getAccessToken(): string | null {
  return token
}

export function setAccessToken(next: string | null): void {
  token = next

  if (next) {
    writeString(TOKEN_KEY, next)
  } else {
    removeKey(TOKEN_KEY)
  }

  for (const listener of listeners) {
    listener(next)
  }
}

export function subscribeToSession(listener: SessionListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGuestId(): string {
  const existing = readString(GUEST_KEY)
  if (existing) return existing

  const created = `guest-${crypto.randomUUID()}`
  writeString(GUEST_KEY, created)

  return created
}

export function rotateGuestId(): string {
  const created = `guest-${crypto.randomUUID()}`
  writeString(GUEST_KEY, created)
  return created
}
