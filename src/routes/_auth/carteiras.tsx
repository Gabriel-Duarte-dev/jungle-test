import { createFileRoute } from '@tanstack/react-router'

import { WalletsPage } from '@/pages/WalletsPage'

export const Route = createFileRoute('/_auth/carteiras')({
  component: WalletsPage,
})
