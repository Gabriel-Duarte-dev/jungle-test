type StorageKind = 'local' | 'session'

function resolveStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJson<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  const storage = resolveStorage(kind)
  if (!storage) return fallback

  try {
    const raw = storage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown, kind: StorageKind = 'local'): void {
  const storage = resolveStorage(kind)
  if (!storage) return

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function readString(key: string, kind: StorageKind = 'local'): string | null {
  const storage = resolveStorage(kind)
  if (!storage) return null

  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string, kind: StorageKind = 'local'): void {
  const storage = resolveStorage(kind)
  if (!storage) return

  try {
    storage.setItem(key, value)
  } catch {
    /* ignored */
  }
}

export function removeKey(key: string, kind: StorageKind = 'local'): void {
  const storage = resolveStorage(kind)
  if (!storage) return

  try {
    storage.removeItem(key)
  } catch {
    /* ignored */
  }
}
