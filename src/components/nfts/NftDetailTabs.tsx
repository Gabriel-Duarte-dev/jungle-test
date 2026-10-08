import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { NETWORK_LABELS } from '@/services/shared.types'
import { type NftDetail } from '@/services/nfts/nfts.types'
import { formatDate } from '@/lib/dates'

const REVIEWS = [
  {
    name: 'Lia Antunes',
    body: 'A paleta e o acabamento granulado ficaram impecáveis na sala. Procedência clara desde a cunhagem.',
  },
  {
    name: 'Rafael Prado',
    body: 'Transferência na rede foi imediata e a ficha de atributos bate com o que o criador descreveu.',
  },
  {
    name: 'Noah Ferraz',
    body: 'Edição limitada bem documentada. Vale como âncora da coleção de retratos digitais.',
  },
] as const

export function NftDetailTabs({ nft }: { nft: NftDetail }) {
  return (
    <Tabs defaultValue="details" className="hidden py-10 lg:block">
      <TabsList>
        <TabsTrigger value="details">Detalhes do NFT</TabsTrigger>
        <TabsTrigger value="reviews">Avaliações de colecionadores (19)</TabsTrigger>
      </TabsList>

      <TabsContent
        value="details"
        className="text-body text-text-secondary mt-8 max-w-200 space-y-4 leading-6"
      >
        <p>
          {nft.description} A tiragem escolhida define o tamanho da edição e o direito de exibição
          associado à carteira do colecionador. Cada transferência permanece registrada na rede com
          o contrato original.
        </p>
        <p>
          Cunhada em {formatDate(nft.mintedAt)} no padrão {nft.tokenStandard}. Royalties de{' '}
          {nft.royaltiesPct}% voltam ao criador {nft.creator.name} em cada revenda.
        </p>
        <dl className="text-text-primary grid gap-2">
          <div>
            <dt className="text-text-secondary inline">Rede: </dt>
            <dd className="inline">{NETWORK_LABELS[nft.network]}</dd>
          </div>
          <div>
            <dt className="text-text-secondary inline">Contrato: </dt>
            <dd className="inline break-all">{nft.contractAddress}</dd>
          </div>
          <div>
            <dt className="text-text-secondary inline">Direitos: </dt>
            <dd className="inline">
              Exibição pessoal e revenda na KURIO. Royalties de {nft.royaltiesPct}% por
              transferência.
            </dd>
          </div>
        </dl>
      </TabsContent>

      <TabsContent value="reviews" className="mt-8 space-y-6">
        {REVIEWS.map((review) => (
          <article key={review.name} className="max-w-200">
            <h3 className="text-body-lg text-text-primary font-bold">{review.name}</h3>
            <p className="text-body text-text-secondary mt-2 leading-6">{review.body}</p>
          </article>
        ))}
      </TabsContent>
    </Tabs>
  )
}
