export const PAGE = 'shell-padding mx-auto w-full max-w-360'

export const PAGE_NARROW = 'shell-padding mx-auto w-full max-w-180'

const AUTH_PATHS = new Set(['/entrar', '/cadastro'])

export function hideMobileChrome(pathname: string) {
  return (
    AUTH_PATHS.has(pathname) ||
    pathname.startsWith('/nfts/') ||
    pathname === '/carrinho' ||
    pathname === '/pagamento' ||
    pathname.startsWith('/pedidos/')
  )
}

export function hideMobileTabBar(pathname: string) {
  return (
    pathname.startsWith('/nfts/') ||
    pathname === '/carrinho' ||
    pathname === '/pagamento' ||
    pathname.startsWith('/pedidos/')
  )
}
