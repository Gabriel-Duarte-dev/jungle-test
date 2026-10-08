import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Hero } from '@/components/home/Hero'
import { PromoSection } from '@/components/home/PromoSection'
import { BlogSection } from '@/components/home/BlogSection'
import { CatalogSection } from '@/components/catalog/CatalogSection'

export function HomePage() {
  useDocumentTitle('KURIO — Marketplace de NFTs')

  return (
    <>
      <Hero />
      <CatalogSection />
      <PromoSection />
      <BlogSection />
    </>
  )
}
