import { Link } from '@tanstack/react-router'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function OutOfScopePage({ title }: { title: string }) {
  useDocumentTitle(`${title} — KURIO`)

  return (
    <div className="shell-padding mx-auto max-w-160 py-16">
      <h1 className="text-heading text-text-primary font-bold">{title}</h1>
      <p className="text-body text-text-secondary mt-4 leading-6">
        Esta seção faz parte do layout editorial e está fora do escopo desta entrega. Nenhuma ação
        aqui é concluída como sucesso.
      </p>
      <Link to="/" className="text-text-accent mt-6 inline-block">
        Voltar ao início
      </Link>
    </div>
  )
}

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada — KURIO')

  return (
    <div className="shell-padding mx-auto max-w-160 py-16">
      <h1 className="text-heading text-text-primary font-bold">Página não encontrada</h1>
      <p className="text-body text-text-secondary mt-4">
        O endereço não corresponde a nenhuma tela do marketplace.
      </p>
      <Link to="/" className="text-text-accent mt-6 inline-block">
        Voltar ao início
      </Link>
    </div>
  )
}
