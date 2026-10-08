import { Link, useRouterState } from '@tanstack/react-router'
import { Heart, Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useCartQuery } from '@/services/cart/cart.queries'
import { useSessionQuery } from '@/services/auth/auth.queries'

const AUTH_PATHS = new Set(['/entrar', '/cadastro'])

export function TabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { user } = useSessionQuery()
  const { data: cart } = useCartQuery()
  const itemCount = cart?.itemCount ?? 0

  if (AUTH_PATHS.has(pathname)) return null

  return (
    <nav
      aria-label="Navegação inferior"
      className="border-border bg-ink fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="relative mx-auto flex h-[72px] max-w-360 items-center justify-between px-8">
        <li>
          <TabLink to="/" label="Início" active={pathname === '/'}>
            <Home aria-hidden className="size-5" />
          </TabLink>
        </li>
        <li>
          <TabLink to="/" hash="catalogo" label="Favoritos" active={false}>
            <Heart aria-hidden className="size-5" />
          </TabLink>
        </li>
        <li className="w-16" aria-hidden />
        <li>
          <TabLink to="/" hash="catalogo" label="Mercado" active={false}>
            <ShoppingBag aria-hidden className="size-5" />
          </TabLink>
        </li>
        <li>
          <TabLink
            to={user ? '/perfil' : '/entrar'}
            label={user ? 'Perfil' : 'Entrar'}
            active={pathname === '/perfil'}
          >
            <User aria-hidden className="size-5" />
          </TabLink>
        </li>
      </ul>

      <Link
        to="/carrinho"
        aria-label={itemCount ? `Carrinho, ${itemCount} itens` : 'Carrinho'}
        className="bg-surface-card text-foreground absolute top-0 left-1/2 grid size-16 -translate-x-1/2 -translate-y-6 place-items-center rounded-full shadow-lg"
      >
        <ShoppingCart aria-hidden className="size-6" />
        {itemCount > 0 && (
          <span className="bg-primary text-micro text-ink absolute top-2 right-2 grid size-4 place-items-center rounded-full font-medium">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </Link>
    </nav>
  )
}

function TabLink({
  to,
  hash,
  label,
  active,
  children,
}: {
  to: string
  hash?: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      hash={hash}
      aria-label={label}
      className={cn(
        'text-text-secondary grid size-10 place-items-center',
        active && 'text-text-accent',
      )}
    >
      {children}
    </Link>
  )
}
