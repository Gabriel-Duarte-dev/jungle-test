import { type User } from '@/services/auth/auth.types'

import { getDb, mutateDb } from '../db'
import { type DbUser, type OwnerKey } from '../db/schema'
import { ownerKeyFor } from '../db/selectors'
import { getScenario } from '../scenarios'

export const GUEST_HEADER = 'x-guest-id'
export const IDEMPOTENCY_HEADER = 'idempotency-key'

export type AuthState =
  | { status: 'anonymous'; userId: null; guestId: string; ownerKey: OwnerKey }
  | { status: 'expired'; userId: null; guestId: string; ownerKey: OwnerKey }
  | { status: 'authenticated'; userId: string; guestId: string; ownerKey: OwnerKey }

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.toLowerCase().startsWith('bearer ')) return null

  const token = header.slice(7).trim()
  return token.length > 0 ? token : null
}

function guestId(request: Request): string {
  return request.headers.get(GUEST_HEADER) ?? 'anonymous'
}

export function resolveAuth(request: Request): AuthState {
  const guest = guestId(request)
  const token = bearerToken(request)

  if (!token) {
    return { status: 'anonymous', userId: null, guestId: guest, ownerKey: ownerKeyFor(null, guest) }
  }

  const db = getDb()
  const session = db.sessions.find((candidate) => candidate.token === token)

  if (!session) {
    return { status: 'expired', userId: null, guestId: guest, ownerKey: ownerKeyFor(null, guest) }
  }

  const expired = getScenario().sessionExpired || Date.parse(session.expiresAt) <= Date.now()

  if (expired) {
    mutateDb((database) => {
      database.sessions = database.sessions.filter((candidate) => candidate.token !== token)
    })

    return { status: 'expired', userId: null, guestId: guest, ownerKey: ownerKeyFor(null, guest) }
  }

  return {
    status: 'authenticated',
    userId: session.userId,
    guestId: guest,
    ownerKey: ownerKeyFor(session.userId, guest),
  }
}

export function findUser(userId: string): DbUser | undefined {
  return getDb().users.find((user) => user.id === userId)
}

export function toUser(user: DbUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  }
}
