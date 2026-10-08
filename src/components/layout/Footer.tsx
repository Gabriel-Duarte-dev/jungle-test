import { Link } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { PAGE } from '@/lib/layout'

const SOCIAL = ['social-1', 'social-2', 'social-3', 'social-4', 'social-5'] as const

export function Footer() {
  const { announce } = useLiveRegion()
  const [email, setEmail] = useState('')

  function onNewsletter(event: FormEvent) {
    event.preventDefault()
    setEmail('')
    announce('Cadastro de novidades está fora do escopo desta entrega.')
  }

  return (
    <footer className="bg-ink mt-24 hidden lg:block">
      <div className={PAGE}>
        <div className="bg-surface-card grid gap-8 rounded-md p-8 lg:grid-cols-[1fr_1px_1fr_1px_1fr_1px_357px] lg:items-start">
          <Feature
            letter="W"
            title="Segurança da carteira"
            body="Proteja sua carteira e colecione arte digital verificada com confiança."
          />
          <div className="bg-primary hidden h-full w-px lg:block" aria-hidden />
          <Feature
            letter="C"
            title="Criadores em destaque"
            body="Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede."
          />
          <div className="bg-primary hidden h-full w-px lg:block" aria-hidden />
          <Feature
            letter="D"
            title="Alertas de lançamentos"
            body="Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado."
          />
          <div className="bg-primary hidden h-full w-px lg:block" aria-hidden />

          <form onSubmit={onNewsletter} className="flex flex-col gap-3">
            <label htmlFor="newsletter-email" className="text-body-xl text-text-primary font-bold">
              Antecipe-se ao próximo
              <br />
              lançamento
            </label>
            <div className="bg-surface-dark flex h-10 overflow-hidden rounded-sm">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu email..."
                className="text-caption text-text-primary h-full flex-1 bg-transparent px-3"
                required
              />
              <Button type="submit" className="h-full rounded-none">
                Enviar
              </Button>
            </div>
            <p className="text-caption-lg text-text-secondary max-w-72.25">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </form>
        </div>

        <div className="bg-surface-dark mt-0 flex flex-col gap-3 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body tracking-wordmark font-bold">KURIO</p>
          <p className="text-caption text-text-secondary">
            Feito para colecionadores, criadores e cultura
          </p>
          <p className="text-caption text-text-secondary">
            <a href="mailto:contato@email.com">contato@email.com</a>
            <span className="mx-2">·</span>
            +55 11 4002 8922
          </p>
        </div>

        <div className="bg-surface-card grid gap-8 p-8 md:grid-cols-2 lg:grid-cols-4">
          <FooterColumn
            title="Meu perfil"
            links={[
              { to: '/perfil', label: 'Meu perfil' },
              { label: 'Minha coleção' },
              { label: 'Atividade' },
              { label: 'Estúdio do criador' },
              { label: 'Lista de interesse' },
            ]}
            onPlaceholder={announce}
          />
          <FooterColumn
            title="Central de ajuda"
            links={[
              { to: '/aprenda', label: 'Central de ajuda' },
              { label: 'Como comprar NFTs' },
              { label: 'Carteira e segurança' },
              { label: 'Política do mercado' },
              { label: 'Denunciar item' },
            ]}
            onPlaceholder={announce}
          />
          <FooterColumn
            title="Coleções"
            links={[
              { to: '/', hash: 'catalogo', label: 'Arte digital' },
              { label: 'Fotografia' },
              { label: 'Música' },
              { label: 'Arte 3D' },
              { label: 'Utilidade' },
            ]}
            onPlaceholder={announce}
          />
          <div className="flex flex-col gap-3">
            <p className="text-body-xl text-text-primary font-bold">Redes sociais</p>
            <div className="flex gap-3">
              {SOCIAL.map((icon) => (
                <span key={icon} className="grid size-8 place-items-center opacity-60" aria-hidden>
                  <img src={`/assets/icons/${icon}.svg`} alt="" width={30} height={30} />
                </span>
              ))}
            </div>
            <p className="text-body-xl text-text-primary mt-3 font-bold">Carteiras compatíveis</p>
            <p className="border-border-soft bg-surface-dark text-tiny tracking-wordmark text-text-accent inline-flex h-6.5 w-fit items-center rounded-sm border px-2 font-bold">
              METAMASK • WALLETCONNECT • COINBASE
            </p>
          </div>
        </div>

        <p className="text-body text-text-secondary py-8 text-center">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  )
}

function Feature({ letter, title, body }: { letter: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="bg-primary text-heading text-ink grid size-18.5 place-items-center rounded-full font-bold">
        {letter}
      </span>
      <h2 className="text-body-xl text-text-primary font-bold">{title}</h2>
      <p className="text-body text-text-secondary max-w-51 leading-5.5">{body}</p>
    </div>
  )
}

function FooterColumn({
  title,
  links,
  onPlaceholder,
}: {
  title: string
  links: Array<{ to?: string; label: string; hash?: string; search?: Record<string, unknown> }>
  onPlaceholder: (message: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-xl text-text-primary font-bold">{title}</p>
      {links.map((link) =>
        link.to ? (
          <Link
            key={link.label}
            to={link.to}
            hash={link.hash}
            search={link.search}
            className="text-body text-text-primary hover:text-text-accent"
          >
            {link.label}
          </Link>
        ) : (
          <button
            key={link.label}
            type="button"
            className="text-body text-text-primary hover:text-text-accent text-left"
            onClick={() => onPlaceholder(`${link.label} está fora do escopo desta entrega.`)}
          >
            {link.label}
          </button>
        ),
      )}
    </div>
  )
}
