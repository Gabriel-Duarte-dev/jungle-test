import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '@/pages/LoginPage'

export const Route = createFileRoute('/entrar')({
  validateSearch: (search: Record<string, unknown>): { from?: string } => {
    if (typeof search.from === 'string' && search.from.length > 0) {
      return { from: search.from }
    }

    return {}
  },
  component: LoginPage,
})
