import { AuthDialog } from '@/components/auth/AuthDialog'
import { AuthMobilePage } from '@/components/auth/AuthMobilePage'
import { MarketplaceBackdrop } from '@/components/auth/MarketplaceBackdrop'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useIsDesktop } from '@/hooks/useMediaQuery'

export function LoginPage() {
  useDocumentTitle('Entrar — KURIO')
  const desktop = useIsDesktop()

  if (desktop) {
    return (
      <>
        <MarketplaceBackdrop />
        <AuthDialog mode="login" />
      </>
    )
  }

  return <AuthMobilePage mode="login" />
}
