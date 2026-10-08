import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/artwork/NftImage'
import { PAGE } from '@/lib/layout'

const POSTS = [
  {
    title: 'Como ler uma cotação em ETH',
    date: '15 de setembro | Leitura de 5 min',
    desc: 'Subtotal, desconto e taxa de rede sem arredondar no caminho.',
    slug: 'ape-emerald',
  },
  {
    title: 'Edições e disponibilidade',
    date: '15 de setembro | Leitura de 4 min',
    desc: 'Por que uma edição esgota sem derrubar as demais da mesma obra.',
    slug: 'ape-sage',
  },
  {
    title: 'Raridade, atributos e procedência',
    date: '15 de setembro | Leitura de 3 min',
    desc: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    slug: 'ape-violet',
  },
  {
    title: 'Como proteger sua carteira',
    date: '15 de setembro | Leitura de 2 min',
    desc: 'Proteja sua carteira, seus ativos e sua identidade.',
    slug: 'ape-amber',
  },
]

export function BlogSection() {
  return (
    <section className={`${PAGE} hidden py-12 lg:block`}>
      <h2 className="text-section text-text-primary font-bold">Diário da Cunhagem</h2>
      <p className="text-body text-text-secondary mt-2">Notas de produto e cultura colecionável.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {POSTS.map((post) => (
          <article key={post.title} className="flex flex-col">
            <div className="bg-surface-card h-[195px] overflow-hidden rounded-md">
              <NftImage
                artwork={{ slug: post.slug, alt: post.title }}
                width={450}
                height={256}
                sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 90vw"
              />
            </div>
            <div className="flex flex-col gap-3 px-4 py-3">
              <p className="text-caption text-text-secondary font-medium">{post.date}</p>
              <h3 className="text-body-lg text-text-primary font-bold">{post.title}</h3>
              <p className="text-caption text-text-secondary font-medium">{post.desc}</p>
              <Link to="/aprenda" className="text-caption text-text-accent">
                Ler mais →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
