import { useRouterState } from '@tanstack/react-router'

import { hideMobileChrome, hideMobileTabBar } from '@/lib/layout'
import { cn } from '@/lib/cn'

import { Header } from './Header'
import { Footer } from './Footer'
import { ScenarioSwitcher } from './ScenarioSwitcher'
import { TabBar } from './TabBar'

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const hideTabBar = hideMobileTabBar(pathname)
  const hideSwitcher = hideMobileChrome(pathname)

  return (
    <div className="bg-ink flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="focus:bg-primary focus:text-ink sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className={cn('flex-1', hideTabBar ? 'pb-0' : 'pb-28 lg:pb-0')}>
        {children}
      </main>
      <Footer />
      {!hideTabBar && <TabBar />}
      <div className={cn(hideSwitcher && 'max-lg:hidden')}>
        <ScenarioSwitcher />
      </div>
    </div>
  )
}
