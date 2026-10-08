import { createFileRoute } from '@tanstack/react-router'

import { OutOfScopePage } from '@/pages/OutOfScopePage'

export const Route = createFileRoute('/aprenda')({
  component: () => <OutOfScopePage title="Aprenda" />,
})
