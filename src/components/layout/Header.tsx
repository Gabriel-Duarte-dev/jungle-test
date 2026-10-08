import { Link, useRouterState } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/Sheet'
import { cn } from '@/lib/cn'
import { hideMobileChrome, PAGE } from '@/lib/layout'

import { useHeader } from './useHeader'

const NAV = [
  { to: '/', label: 'Início', hash: undefined as string | undefined },
  { to: '/', label: 'Mercado', hash: 'catalogo' },
  { to: '/criadores', label: 'Criadores' },
  { to: '/aprenda', label: 'Aprenda' },
] as const

const AUTH_PATHS = new Set(['/entrar', '/cadastro'])

export function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuth = AUTH_PATHS.has(pathname)
  const hideMobile = hideMobileChrome(pathname)

  return (
    <header className={cn(pathname.startsWith('/nfts/') ? 'bg-surface-card lg:bg-ink' : 'bg-ink')}>
      <div className={cn(isAuth && 'hidden lg:block')}>
        <DesktopHeader />
        {!hideMobile && <MobileHeader />}
      </div>
    </header>
  )
}

function DesktopHeader() {
  const { user, itemCount, query, onQueryChange, onSearch, onLogout, isActive } = useHeader()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className={`hidden lg:block ${PAGE}`}>
      <div className="grid h-11.25 grid-cols-[1fr_auto_1fr] items-center">
        <Link
          to="/"
          className="text-body tracking-wordmark text-foreground w-40 font-bold"
          aria-label="KURIO, página inicial"
        >
          KURIO
        </Link>

        <nav aria-label="Principal" className="flex h-full items-stretch gap-10">
          {NAV.map((item) => {
            const active = isActive(item.to, item.label)
            return (
              <Link
                key={item.label}
                to={item.to}
                hash={'hash' in item ? item.hash : undefined}
                className={cn(
                  'text-body-lg text-foreground hover:text-text-accent relative flex h-full items-start pt-2',
                  active &&
                    'text-text-accent after:bg-text-accent font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center justify-end gap-7">
          <div className="relative">
            <button
              type="button"
              className="text-foreground grid size-5 place-items-center"
              aria-label="Abrir busca"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search aria-hidden className="size-5" />
            </button>
            {searchOpen && (
              <form
                onSubmit={(event) => {
                  onSearch(event)
                  setSearchOpen(false)
                }}
                className="border-border-soft bg-surface-dark absolute top-full right-0 z-20 mt-3 flex items-center gap-2 rounded-sm border p-2"
              >
                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Buscar NFTs"
                  aria-label="Buscar NFTs"
                  className="text-caption text-text-primary h-9 w-48 bg-transparent px-2"
                  autoFocus
                />
                <button
                  type="submit"
                  className="grid size-8 place-items-center"
                  aria-label="Enviar busca"
                >
                  <Search aria-hidden className="size-4" />
                </button>
              </form>
            )}
          </div>

          <Link
            to="/carrinho"
            className="text-foreground relative grid size-6 place-items-center"
            aria-label={itemCount ? `Carrinho, ${itemCount} itens` : 'Carrinho'}
          >
            <ShoppingCart aria-hidden className="size-6" />
            {itemCount > 0 && (
              <span className="bg-primary text-micro text-ink absolute -top-1 -right-1 grid size-4 place-items-center rounded-full font-medium">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/perfil"
                className="text-caption text-text-secondary hover:text-text-accent max-w-36 truncate"
              >
                {user.name}
              </Link>
              <Button type="button" size="sm" variant="secondary" onClick={onLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="text-body-lg w-25 gap-1 font-medium">
              <Link to="/entrar">
                <LogIn aria-hidden className="size-5" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="bg-primary/20 h-px w-full" aria-hidden />
    </div>
  )
}

function MobileHeader() {
  const { query, onQueryChange, onSearch } = useHeader()

  return (
    <div className="px-6 pt-10 pb-2 lg:hidden">
      <div className="flex items-center gap-2">
        <form
          onSubmit={onSearch}
          className="bg-surface-card flex h-11.25 min-w-0 flex-1 items-center gap-2 rounded-full px-3"
        >
          <Search aria-hidden className="text-text-secondary size-5.5 shrink-0" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Explorar coleções"
            aria-label="Explorar coleções"
            className="text-body text-text-primary placeholder:text-text-secondary h-full min-w-0 flex-1 bg-transparent"
          />
        </form>
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Filtros"
              className="bg-surface-card text-foreground grid size-11.25 shrink-0 place-items-center rounded-full"
            >
              <SlidersHorizontal aria-hidden className="size-5.5" />
            </button>
          </SheetTrigger>
          <SheetContent>
            <div className="mb-4 flex items-center justify-between gap-3">
              <SheetTitle>Filtros</SheetTitle>
              <SheetClose asChild>
                <Button type="button" variant="ghost" size="sm">
                  Fechar
                </Button>
              </SheetClose>
            </div>
            <div className="overflow-y-auto">
              <CatalogFilters />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
