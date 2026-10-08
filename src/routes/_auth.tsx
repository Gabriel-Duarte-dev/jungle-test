import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getAccessToken } from '@/services/http/session-store'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    if (!getAccessToken()) {
      throw redirect({
        to: '/entrar',
        search: { from: location.pathname },
      })
    }
  },
  component: () => <Outlet />,
})
