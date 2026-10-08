import { createId, mutateDb } from '..'
import { type DbCart, type MockDatabase, type OwnerKey } from '../schema'
import { findCart, findNft } from '../selectors'

function touch(cart: DbCart): void {
  cart.version += 1
  cart.updatedAt = new Date().toISOString()
}

export function getOrCreateCart(ownerKey: OwnerKey): DbCart {
  return mutateDb((db) => {
    const existing = findCart(db, ownerKey)
    if (existing) return existing

    const cart: DbCart = {
      id: createId('cart'),
      ownerKey,
      items: [],
      version: 1,
      updatedAt: new Date().toISOString(),
    }

    db.carts.push(cart)
    return cart
  })
}

export type CartMutationResult =
  | { ok: true; cart: DbCart }
  | {
      ok: false
      reason: 'nft_not_found' | 'edition_not_found' | 'item_not_found' | 'unavailable'
      max?: number
    }

export function addItem(
  ownerKey: OwnerKey,
  input: { nftId: string; editionId: string; quantity: number },
): CartMutationResult {
  return mutateDb((db) => {
    const nft = findNft(db, input.nftId)
    if (!nft) return { ok: false, reason: 'nft_not_found' } as const

    const edition = nft.editions.find((candidate) => candidate.id === input.editionId)
    if (!edition) return { ok: false, reason: 'edition_not_found' } as const

    const cart = getOrCreateCart(ownerKey)
    const existing = cart.items.find(
      (item) => item.nftId === input.nftId && item.editionId === input.editionId,
    )

    const desired = (existing?.quantity ?? 0) + input.quantity

    if (edition.status !== 'available' || edition.available === 0) {
      return { ok: false, reason: 'unavailable', max: 0 } as const
    }

    if (desired > edition.available) {
      return { ok: false, reason: 'unavailable', max: edition.available } as const
    }

    if (existing) {
      existing.quantity = desired
      existing.knownUnitPriceEth = edition.priceEth
    } else {
      cart.items.push({
        id: createId('ci'),
        nftId: input.nftId,
        editionId: input.editionId,
        quantity: input.quantity,
        addedAt: new Date().toISOString(),
        knownUnitPriceEth: edition.priceEth,
      })
    }

    touch(cart)
    return { ok: true, cart } as const
  })
}

export function updateItemQuantity(
  ownerKey: OwnerKey,
  itemId: string,
  quantity: number,
): CartMutationResult {
  return mutateDb((db) => {
    const cart = findCart(db, ownerKey)
    const item = cart?.items.find((candidate) => candidate.id === itemId)

    if (!cart || !item) return { ok: false, reason: 'item_not_found' } as const

    const nft = findNft(db, item.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)

    if (!nft || !edition) return { ok: false, reason: 'edition_not_found' } as const

    if (quantity > edition.available) {
      return { ok: false, reason: 'unavailable', max: edition.available } as const
    }

    item.quantity = quantity
    item.knownUnitPriceEth = edition.priceEth
    touch(cart)

    return { ok: true, cart } as const
  })
}

export function removeItem(ownerKey: OwnerKey, itemId: string): CartMutationResult {
  return mutateDb((db) => {
    const cart = findCart(db, ownerKey)
    if (!cart) return { ok: false, reason: 'item_not_found' } as const

    const index = cart.items.findIndex((candidate) => candidate.id === itemId)
    if (index === -1) return { ok: false, reason: 'item_not_found' } as const

    cart.items.splice(index, 1)
    touch(cart)

    return { ok: true, cart } as const
  })
}

export function acknowledgePrices(ownerKey: OwnerKey): DbCart | undefined {
  return mutateDb((db) => {
    const cart = findCart(db, ownerKey)
    if (!cart) return undefined

    for (const item of cart.items) {
      const nft = findNft(db, item.nftId)
      const edition = nft?.editions.find((candidate) => candidate.id === item.editionId)
      if (edition) item.knownUnitPriceEth = edition.priceEth
    }

    touch(cart)
    return cart
  })
}

export function mergeGuestCart(db: MockDatabase, guestKey: OwnerKey, userKey: OwnerKey): void {
  const guestCart = findCart(db, guestKey)
  if (!guestCart || guestCart.items.length === 0) return

  const userCart = findCart(db, userKey) ?? {
    id: createId('cart'),
    ownerKey: userKey,
    items: [],
    version: 1,
    updatedAt: new Date().toISOString(),
  }

  if (!db.carts.includes(userCart)) db.carts.push(userCart)

  for (const guestItem of guestCart.items) {
    const nft = findNft(db, guestItem.nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === guestItem.editionId)
    if (!edition) continue

    const existing = userCart.items.find(
      (item) => item.nftId === guestItem.nftId && item.editionId === guestItem.editionId,
    )

    if (existing) {
      existing.quantity = Math.min(existing.quantity + guestItem.quantity, edition.available)
    } else {
      userCart.items.push({
        ...guestItem,
        id: createId('ci'),
        quantity: Math.min(guestItem.quantity, edition.available),
      })
    }
  }

  userCart.items = userCart.items.filter((item) => item.quantity > 0)
  touch(userCart)

  db.carts = db.carts.filter((cart) => cart.ownerKey !== guestKey)
}

export function removePurchasedItems(
  ownerKey: OwnerKey,
  purchased: Array<{ nftId: string; editionId: string; quantity: number }>,
): void {
  mutateDb((db) => {
    const cart = findCart(db, ownerKey)
    if (!cart) return

    for (const line of purchased) {
      const item = cart.items.find(
        (candidate) => candidate.nftId === line.nftId && candidate.editionId === line.editionId,
      )
      if (!item) continue

      item.quantity -= line.quantity
    }

    cart.items = cart.items.filter((item) => item.quantity > 0)
    touch(cart)
  })
}
