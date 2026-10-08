import { Link, useRouterState } from '@tanstack/react-router'
import { Activity, Download, Heart, HelpCircle, LogOut, Tag, User, Wallet } from 'lucide-react'

import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { useLogoutMutation } from '@/services/auth/auth.queries'
import { cn } from '@/lib/cn'
import { PAGE } from '@/lib/layout'

const LINKS = [
  { to: '/perfil', label: 'Dados do perfil', icon: User },
  { to: '/carteiras', label: 'Carteiras', icon: Wallet },
] as const

const PLACEHOLDERS = [
  { label: 'Atividade', icon: Activity },
  { label: 'Lista de interesse', icon: Heart },
  { label: 'Ofertas', icon: Tag },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: HelpCircle },
] as const

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const logout = useLogoutMutation()
  const { announce } = useLiveRegion()

  return (
    <div className={`${PAGE} grid gap-8 py-10 lg:grid-cols-[310px_minmax(0,1fr)]`}>
      <aside className="bg-surface-card flex h-fit flex-col rounded-md py-4">
        <p className="text-body-lg text-text-primary px-5 pb-3 font-bold">Meu perfil</p>
        {LINKS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-body text-text-secondary hover:text-text-accent relative flex h-11 items-center gap-3 px-5',
                active &&
                  'bg-surface-dark text-text-accent before:bg-primary font-medium before:absolute before:inset-y-0 before:left-0 before:w-0.5',
              )}
            >
              <Icon aria-hidden className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
        {PLACEHOLDERS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              className="text-body text-text-secondary hover:text-text-accent flex h-11 items-center gap-3 px-5 text-left"
              onClick={() => announce(`${item.label} está fora do escopo desta entrega.`)}
            >
              <Icon aria-hidden className="size-4.5" />
              {item.label}
            </button>
          )
        })}
        <div className="border-border mt-2 border-t">
          <button
            type="button"
            className="text-body text-text-secondary hover:text-text-accent flex h-11 w-full items-center gap-3 px-5"
            onClick={() => logout.mutate()}
          >
            <LogOut aria-hidden className="size-5" />
            Sair
          </button>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
