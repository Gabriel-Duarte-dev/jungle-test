import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { PAGE } from '@/lib/layout'

const PROMOS = [
  {
    title: 'Lançamentos da semana',
    body: 'Edições recém-cunhadas com taxa de rede explícita e disponibilidade ao vivo.',
    to: '/',
    search: { tab: 'new' as const },
    image: '/assets/nft/ape-emerald-450.webp',
  },
  {
    title: 'Peças em alta',
    body: 'O que a comunidade está colecionando agora, ordenado por popularidade.',
    to: '/',
    search: { tab: 'trending' as const },
    image: '/assets/nft/ape-violet-450.webp',
  },
]

export function PromoSection() {
  return (
    <section className={`${PAGE} hidden gap-6 py-12 lg:grid lg:grid-cols-2`}>
      {PROMOS.map((promo) => (
        <article
          key={promo.title}
          className="bg-surface-card relative flex min-h-62.5 overflow-hidden rounded-md"
        >
          <img
            src={promo.image}
            alt=""
            width={290}
            height={250}
            className="hidden h-full w-[45%] object-cover sm:block"
          />
          <div className="flex flex-1 flex-col items-end justify-center gap-3 p-6 text-right">
            <h2 className="text-subtitle text-text-primary leading-6 font-bold">{promo.title}</h2>
            <p className="text-body text-text-secondary max-w-xs leading-6">{promo.body}</p>
            <Button asChild className="h-10 w-35 uppercase">
              <Link to={promo.to} search={promo.search} hash="catalogo">
                Explorar
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </section>
  )
}
