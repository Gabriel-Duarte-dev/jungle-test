import { type LiveNftChange } from '../../scenarios/scenarios.types'
import { emitNftUpdated } from '../../socket/emitter'
import { mutateDb } from '..'
import { type DbNft } from '../schema'

function bumpVersion(nft: DbNft): void {
  nft.version += 1
}

export function toggleFavorite(userId: string, nftId: string, favorited: boolean): void {
  mutateDb((db) => {
    const existing = db.favorites.findIndex(
      (favorite) => favorite.userId === userId && favorite.nftId === nftId,
    )

    if (favorited && existing === -1) {
      db.favorites.push({ userId, nftId, createdAt: new Date().toISOString() })
    }

    if (!favorited && existing !== -1) {
      db.favorites.splice(existing, 1)
    }
  })
}

export function applyLiveChange(change: LiveNftChange): void {
  const changed = mutateDb((db) => {
    const nft = db.nfts.find((candidate) => candidate.id === change.nftId)
    if (!nft) return false

    if (change.priceEth) {
      nft.compareAtPriceEth = nft.priceEth
      nft.priceEth = change.priceEth

      for (const edition of nft.editions) {
        edition.priceEth = change.priceEth
      }
    }

    if (change.soldOut) {
      const targets = change.editionId
        ? nft.editions.filter((edition) => edition.id === change.editionId)
        : nft.editions

      for (const edition of targets) {
        edition.available = 0
        edition.status = 'sold_out'
      }
    }

    bumpVersion(nft)
    return true
  })

  if (changed) emitNftUpdated(change.nftId)
}

export function consumeInventory(
  lines: Array<{ nftId: string; editionId: string; quantity: number }>,
): void {
  const touched = mutateDb((db) => {
    const ids = new Set<string>()

    for (const line of lines) {
      const nft = db.nfts.find((candidate) => candidate.id === line.nftId)
      if (!nft) continue

      const edition = nft.editions.find((candidate) => candidate.id === line.editionId)
      if (!edition) continue

      edition.available = Math.max(0, edition.available - line.quantity)
      if (edition.available === 0) edition.status = 'sold_out'

      bumpVersion(nft)
      ids.add(nft.id)
    }

    return [...ids]
  })

  for (const id of touched) {
    emitNftUpdated(id)
  }
}
