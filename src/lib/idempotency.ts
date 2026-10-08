import { readJson, removeKey, writeJson } from './storage'

const STORAGE_KEY = 'kurio.checkout.attempt'

export interface CheckoutAttempt {
  key: string

  quoteSignature: string
  createdAt: string

  orderId?: string
}

export function getOrCreateAttempt(quoteSignature: string): CheckoutAttempt {
  const existing = readJson<CheckoutAttempt | null>(STORAGE_KEY, null)

  if (existing && existing.quoteSignature === quoteSignature) {
    return existing
  }

  const attempt: CheckoutAttempt = {
    key: crypto.randomUUID(),
    quoteSignature,
    createdAt: new Date().toISOString(),
  }

  writeJson(STORAGE_KEY, attempt)

  return attempt
}

export function readAttempt(): CheckoutAttempt | null {
  return readJson<CheckoutAttempt | null>(STORAGE_KEY, null)
}

export function rememberAttemptOrder(orderId: string): void {
  const existing = readAttempt()
  if (!existing) return

  writeJson(STORAGE_KEY, { ...existing, orderId })
}

export function clearAttempt(): void {
  removeKey(STORAGE_KEY)
}
