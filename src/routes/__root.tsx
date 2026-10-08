import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'

import { LiveRegionProvider } from '@/components/a11y/LiveRegion'
import { PageShell } from '@/components/layout/PageShell'
import { Toaster } from '@/components/ui/Toaster'
import { SocketProvider } from '@/realtime/SocketProvider'
import { SessionExpiryListener } from '@/providers/SessionExpiryListener'
import { NotFoundPage } from '@/pages/OutOfScopePage'
import { ErrorState } from '@/components/feedback/EmptyState'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => (
    <div className="shell-padding mx-auto max-w-180 py-16">
      <ErrorState error={error} onRetry={reset} />
    </div>
  ),
})

function RootLayout() {
  return (
    <LiveRegionProvider>
      <SocketProvider>
        <SessionExpiryListener />
        <PageShell>
          <Outlet />
        </PageShell>
        <Toaster />
      </SocketProvider>
    </LiveRegionProvider>
  )
}
