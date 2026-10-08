import { createFileRoute } from '@tanstack/react-router'

import { RegisterPage } from '@/pages/RegisterPage'

export const Route = createFileRoute('/cadastro')({
  validateSearch: (search: Record<string, unknown>): { from?: string } => {
    if (typeof search.from === 'string' && search.from.length > 0) {
      return { from: search.from }
    }

    return {}
  },
  component: RegisterPage,
})
