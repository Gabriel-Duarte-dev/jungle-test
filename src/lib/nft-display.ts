import { RARITY_LABELS } from '@/services/shared.types'
import { type NftAttribute, type NftDetail, type NftEdition } from '@/services/nfts/nfts.types'

export function formatTokenId(nftId: string) {
  const match = nftId.match(/(\d+)$/)
  const n = match ? Number(match[1]) : 0
  return `#${String(n).padStart(4, '0')}`
}

export function editionShortLabel(edition: Pick<NftEdition, 'number' | 'totalInRun'>) {
  return `${edition.number}/${edition.totalInRun}`
}

export function shortEditionFromLabel(label: string) {
  const match = label.match(/(\d+)\s+de\s+(\d+)/i)
  if (match) return `${match[1]}/${match[2]}`
  return label
}

export function attributeSummary(nft: Pick<NftDetail, 'attributes' | 'rarity'>) {
  const values = nft.attributes.map((item: NftAttribute) => item.value)
  return [...values, RARITY_LABELS[nft.rarity]].join(', ')
}
