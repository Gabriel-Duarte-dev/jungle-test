import { attributeSummary, formatTokenId } from '@/lib/nft-display'
import { type NftDetail } from '@/services/nfts/nfts.types'

export function NftMeta({ nft }: { nft: NftDetail }) {
  return (
    <dl className="text-caption text-text-secondary flex flex-col gap-1">
      <div>
        <dt className="inline">ID do token: </dt>
        <dd className="inline">{formatTokenId(nft.id)}</dd>
      </div>
      <div>
        <dt className="inline">Coleção: </dt>
        <dd className="inline">{nft.collection.name}</dd>
      </div>
      <div>
        <dt className="inline">Atributos: </dt>
        <dd className="inline">{attributeSummary(nft)}</dd>
      </div>
    </dl>
  )
}
