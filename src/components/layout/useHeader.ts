import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate, useRouterState, useSearch } from '@tanstack/react-router'

import { useSessionQuery, useLogoutMutation } from '@/services/auth/auth.queries'
import { useCartQuery } from '@/services/cart/cart.queries'

export function useHeader() {
  const { user } = useSessionQuery()
  const { data: cart } = useCartQuery()
  const logout = useLogoutMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const search = useSearch({ strict: false, shouldThrow: false }) as { q?: string }
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [query, setQuery] = useState(() => search.q ?? '')
  const [menuOpen, setMenuOpen] = useState(false)

  function onSearch(event: FormEvent) {
    event.preventDefault()
    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        q: query.trim() || undefined,
        page: undefined,
      }),
    })
    setMenuOpen(false)
  }

  function isActive(to: string, label: string) {
    if (label === 'Mercado') {
      return (
        (pathname === '/' && location.hash === 'catalogo') ||
        pathname.startsWith('/nfts/') ||
        pathname === '/carrinho' ||
        pathname === '/pagamento'
      )
    }
    if (to === '/') return pathname === '/' && location.hash !== 'catalogo' && label === 'Início'
    return pathname === to
  }

  return {
    user,
    itemCount: cart?.itemCount ?? 0,
    query,
    menuOpen,
    onToggleMenu: () => setMenuOpen((value) => !value),
    onQueryChange: setQuery,
    onSearch,
    onLogout: () => logout.mutate(),
    isActive,
  }
}
