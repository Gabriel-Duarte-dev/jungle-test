import { http } from 'msw'

import { type FieldErrors } from '@/services/http/errors'
import {
  type ChangePasswordPayload,
  type UpdateAvatarPayload,
  type UpdateProfilePayload,
} from '@/services/profile/profile.types'

import { createId, getDb, mutateDb } from '../db'
import { findUser, resolveAuth, toUser } from '../support/auth'
import { hashPassword, verifyPassword } from '../support/hash'
import {
  applyScenario,
  conflict,
  jsonOk,
  noContent,
  sessionExpired,
  unauthenticated,
  validationError,
} from '../support/response'
import { api } from './paths'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const HANDLE_PATTERN = /^@[a-z0-9_.]{3,20}$/

export const profileHandlers = [
  http.get(api('/profile'), async ({ request }) => {
    const short = await applyScenario('profile.get')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const user = findUser(auth.userId)
    if (!user) return unauthenticated()

    return jsonOk(toUser(user))
  }),

  http.patch(api('/profile'), async ({ request }) => {
    const short = await applyScenario('profile.update')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const payload = (await request.json()) as Partial<UpdateProfilePayload>
    const fields: FieldErrors = {}

    if (!payload.name || payload.name.trim().length < 3) {
      fields.name = 'Informe seu nome completo (mínimo de 3 caracteres).'
    }

    if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
      fields.email = 'Informe um e-mail válido.'
    }

    if (!payload.handle || !HANDLE_PATTERN.test(payload.handle)) {
      fields.handle = 'Use @ seguido de 3 a 20 letras, números, ponto ou underscore.'
    }

    if (payload.bio && payload.bio.length > 280) {
      fields.bio = 'A bio deve ter no máximo 280 caracteres.'
    }

    if (Object.keys(fields).length > 0) return validationError(fields)

    const email = payload.email!.trim().toLowerCase()
    const handle = payload.handle!.trim().toLowerCase()
    const db = getDb()

    if (db.users.some((user) => user.id !== auth.userId && user.email === email)) {
      return conflict('conflict', 'Este e-mail já está em uso por outra conta.', {
        fields: { email: 'Este e-mail já está em uso.' },
      })
    }

    if (db.users.some((user) => user.id !== auth.userId && user.handle === handle)) {
      return conflict('conflict', 'Este nome de usuário já está em uso.', {
        fields: { handle: 'Este nome de usuário já está em uso.' },
      })
    }

    const updated = mutateDb((database) => {
      const user = database.users.find((candidate) => candidate.id === auth.userId)!
      user.name = payload.name!.trim()
      user.email = email
      user.handle = handle
      user.bio = payload.bio?.trim() ?? ''
      return user
    })

    return jsonOk(toUser(updated))
  }),

  http.put(api('/profile/avatar'), async ({ request }) => {
    const short = await applyScenario('profile.update')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const payload = (await request.json()) as Partial<UpdateAvatarPayload>

    if (!payload.dataUrl?.startsWith('data:image/')) {
      return validationError({ avatar: 'Envie uma imagem PNG, JPG ou WEBP.' })
    }

    if (payload.dataUrl.length > 1_400_000) {
      return validationError({ avatar: 'A imagem deve ter no máximo 1 MB.' })
    }

    const updated = mutateDb((database) => {
      const user = database.users.find((candidate) => candidate.id === auth.userId)!
      user.avatarUrl = payload.dataUrl!
      return user
    })

    return jsonOk(toUser(updated))
  }),

  http.delete(api('/profile/avatar'), async ({ request }) => {
    const short = await applyScenario('profile.update')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const updated = mutateDb((database) => {
      const user = database.users.find((candidate) => candidate.id === auth.userId)!
      user.avatarUrl = null
      return user
    })

    return jsonOk(toUser(updated))
  }),

  http.post(api('/profile/password'), async ({ request }) => {
    const short = await applyScenario('profile.password')
    if (short) return short

    const auth = resolveAuth(request)
    if (auth.status === 'expired') return sessionExpired()
    if (auth.status === 'anonymous') return unauthenticated()

    const payload = (await request.json()) as Partial<ChangePasswordPayload>
    const fields: FieldErrors = {}

    if (!payload.currentPassword) {
      fields.currentPassword = 'Informe a senha atual.'
    }

    if (!payload.newPassword || payload.newPassword.length < 8) {
      fields.newPassword = 'A nova senha precisa ter ao menos 8 caracteres.'
    } else if (!/[A-Z]/.test(payload.newPassword) || !/\d/.test(payload.newPassword)) {
      fields.newPassword = 'Use ao menos uma letra maiúscula e um número.'
    }

    if (payload.newPassword !== payload.confirmPassword) {
      fields.confirmPassword = 'As senhas não coincidem.'
    }

    if (Object.keys(fields).length > 0) return validationError(fields)

    const user = findUser(auth.userId)
    if (!user) return unauthenticated()

    const matches = await verifyPassword(
      payload.currentPassword!,
      user.passwordSalt,
      user.passwordHash,
    )

    if (!matches) {
      return validationError({ currentPassword: 'Senha atual incorreta.' })
    }

    const salt = createId('salt')
    const passwordHash = await hashPassword(payload.newPassword!, salt)

    mutateDb((database) => {
      const record = database.users.find((candidate) => candidate.id === auth.userId)!
      record.passwordSalt = salt
      record.passwordHash = passwordHash

      database.sessions = database.sessions.filter(
        (session) =>
          session.userId !== auth.userId ||
          session.token === request.headers.get('authorization')?.slice(7).trim(),
      )
    })

    return noContent()
  }),
]
