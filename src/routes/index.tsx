import { createFileRoute } from '@tanstack/react-router'

import { parseCatalogSearch } from '@/lib/catalog-search'
import { HomePage } from '@/pages/HomePage'

export const Route = createFileRoute('/')({
  validateSearch: parseCatalogSearch,
  component: HomePage,
})
