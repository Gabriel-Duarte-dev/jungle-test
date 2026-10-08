import { createFileRoute } from '@tanstack/react-router'

import { OutOfScopePage } from '@/pages/OutOfScopePage'

export const Route = createFileRoute('/criadores')({
  component: () => <OutOfScopePage title="Criadores" />,
})
