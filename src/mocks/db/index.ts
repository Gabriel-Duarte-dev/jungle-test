import { readJson, removeKey, writeJson } from '@/lib/storage'

import { type MockDatabase, SCHEMA_VERSION } from './schema'
import { createSeedDatabase } from './seed'

const STORAGE_KEY = 'kurio.mock.db'

let database: MockDatabase | null = null

function persist(): void {
  if (!database) return
  writeJson(STORAGE_KEY, database)
}

function isUsable(candidate: MockDatabase | null): candidate is MockDatabase {
  return (
    candidate !== null &&
    typeof candidate === 'object' &&
    candidate.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(candidate.nfts) &&
    candidate.nfts.length > 0
  )
}

export async function initDatabase(scenarioId: string): Promise<MockDatabase> {
  const persisted = readJson<MockDatabase | null>(STORAGE_KEY, null)

  if (isUsable(persisted) && persisted.scenarioId === scenarioId) {
    database = persisted
    return database
  }

  database = await createSeedDatabase(scenarioId)
  persist()

  return database
}

export function getDb(): MockDatabase {
  if (!database) {
    throw new Error('Mock database accessed before initDatabase() completed.')
  }

  return database
}

export function mutateDb<T>(mutation: (db: MockDatabase) => T): T {
  const result = mutation(getDb())
  persist()
  return result
}

export async function resetDatabase(scenarioId: string): Promise<MockDatabase> {
  removeKey(STORAGE_KEY)
  database = await createSeedDatabase(scenarioId)
  persist()

  return database
}

export function nextSequence(): number {
  const db = getDb()
  db.sequence += 1
  return db.sequence
}

export function createId(prefix: string): string {
  return `${prefix}-${nextSequence().toString(36)}-${Date.now().toString(36)}`
}
