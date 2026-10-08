import { http } from 'msw'

import { type LoginPayload, type RegisterPayload, type Session } from '@/services/auth/auth.types'
import { type FieldErrors } from '@/services/http/errors'

import { createId, getDb, mutateDb } from '../db'
import { mergeGuestCart } from '../db/operations/cart'
import { ownerKeyFor } from '../db/selectors'
import { getScenario } from '../scenarios'
import { GUEST_HEADER, resolveAuth, toUser } from '../support/auth'
import { hashPassword, verifyPassword } from '../support/hash'
import {
  applyScenario,
  conflict,
  errorResponse,
  jsonOk,
  noContent,
  sessionExpired,
  unauthenticated,
  validationError,
} from '../support/response'
import { api } from './paths'

const SESSION_TTL_MS = 30 * 60_000

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateRegister(payload: Partial<RegisterPayload>): FieldErrors {
  const fields: FieldErrors = {}

  if (!payload.name || payload.name.trim().length < 3) {
    fields.name = 'Informe seu nome completo (mínimo de 3 caracteres).'
  }

  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
    fields.email = 'Informe um e-mail válido.'
  }

  if (!payload.password || payload.password.length < 8) {
    fields.password = 'A senha precisa ter ao menos 8 caracteres.'
  } else if (!/[A-Z]/.test(payload.password) || !/\d/.test(payload.password)) {
    fields.password = 'Use ao menos uma letra maiúscula e um número.'
  }

  return fields
}

function issueSession(userId: string, guestId: string): Session {
  return mutateDb((db) => {
    const user = db.users.find((candidate) => candidate.id === userId)!
    const token = createId('tok')
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

    db.sessions.push({ token, userId, expiresAt, createdAt: new Date().toISOString() })

    mergeGuestCart(db, ownerKeyFor(null, guestId), ownerKeyFor(userId, guestId))

    return { user: toUser(user), accessToken: token, expiresAt }
  })
}

export const authHandlers = [
  http.post(api('/auth/register'), async ({ request }) => {
    const short = await applyScenario('auth.register')
    if (short) return short

    const payload = (await request.json()) as Partial<RegisterPayload>
    const fields = validateRegister(payload)

    if (Object.keys(fields).length > 0) {
      return validationError(fields)
    }

    const email = payload.email!.trim().toLowerCase()
    const db = getDb()

    if (getScenario().registerConflict || db.users.some((user) => user.email === email)) {
      return conflict('conflict', 'Este e-mail já está cadastrado.', {
        fields: { email: 'Este e-mail já está cadastrado.' },
      })
    }

    const salt = createId('salt')
    const name = payload.name!.trim()

    const userId = await (async () => {
      const passwordHash = await hashPassword(payload.password!, salt)

      return mutateDb((database) => {
        const id = createId('user')
        const handle = `@${
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 16) || 'colecionador'
        }`

        database.users.push({
          id,
          name,
          email,
          handle,
          passwordHash,
          passwordSalt: salt,
          avatarUrl: null,
          bio: '',
          createdAt: new Date().toISOString(),
        })

        return id
      })
    })()

    const guestId = request.headers.get(GUEST_HEADER) ?? 'anonymous'

    return jsonOk(issueSession(userId, guestId), 201)
  }),

  http.post(api('/auth/login'), async ({ request }) => {
    const short = await applyScenario('auth.login')
    if (short) return short

    const payload = (await request.json()) as Partial<LoginPayload>
    const fields: FieldErrors = {}

    if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
      fields.email = 'Informe um e-mail válido.'
    }
    if (!payload.password) {
      fields.password = 'Informe sua senha.'
    }

    if (Object.keys(fields).length > 0) {
      return validationError(fields)
    }

    const email = payload.email!.trim().toLowerCase()
    const user = getDb().users.find((candidate) => candidate.email === email)

    if (!user || !(await verifyPassword(payload.password!, user.passwordSalt, user.passwordHash))) {
      return errorResponse(401, 'invalid_credentials', 'E-mail ou senha incorretos.')
    }

    const guestId = request.headers.get(GUEST_HEADER) ?? 'anonymous'

    return jsonOk(issueSession(user.id, guestId))
  }),

  http.get(api('/auth/session'), async ({ request }) => {
    const short = await applyScenario('auth.session')
    if (short) return short

    const auth = resolveAuth(request)

    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const user = getDb().users.find((candidate) => candidate.id === auth.userId)
    if (!user) return unauthenticated()

    const session = getDb().sessions.find((candidate) => candidate.userId === auth.userId)

    return jsonOk({
      user: toUser(user),
      accessToken: session?.token ?? '',
      expiresAt: session?.expiresAt ?? new Date().toISOString(),
    })
  }),

  http.post(api('/auth/logout'), async ({ request }) => {
    const short = await applyScenario('auth.session')
    if (short) return short

    const token = request.headers.get('authorization')?.slice(7).trim()

    mutateDb((db) => {
      db.sessions = db.sessions.filter((session) => session.token !== token)
    })

    return noContent()
  }),
]
