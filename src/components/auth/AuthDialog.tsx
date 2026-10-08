import { Link, useNavigate, useSearch } from '@tanstack/react-router'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'

import { AuthSocial } from './AuthSocial'
import { LoginForm, RegisterForm } from './AuthForms'

interface AuthDialogProps {
  mode: 'login' | 'register'
}

export function AuthDialog({ mode }: AuthDialogProps) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false, shouldThrow: false }) as { from?: string }
  const from = search.from

  function onOpenChange(open: boolean) {
    if (!open) {
      void navigate({ to: from || '/' })
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-2rem,500px)] overflow-hidden rounded-md border-0 p-0">
        <div className="bg-surface-card relative flex flex-col pt-12">
          <div className="flex flex-col items-center gap-10 px-12">
            <div className="flex items-center justify-center gap-2">
              <TabLink to="/entrar" active={mode === 'login'} from={from}>
                Entrar
              </TabLink>
              <span className="bg-text-coral h-5 w-px" aria-hidden />
              <TabLink to="/cadastro" active={mode === 'register'} from={from}>
                Criar conta
              </TabLink>
            </div>
            <DialogTitle className="sr-only">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </DialogTitle>
            <DialogDescription className="text-caption-lg text-foreground text-center">
              {mode === 'login'
                ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
                : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-6 px-20 pt-6 pb-8">
            {mode === 'login' ? <LoginForm compact /> : <RegisterForm compact />}
            <AuthSocial />
          </div>
          <div className="bg-primary h-2.5 w-full" aria-hidden />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TabLink({
  to,
  active,
  from,
  children,
}: {
  to: '/entrar' | '/cadastro'
  active: boolean
  from?: string
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      search={from ? { from } : undefined}
      className={cn('text-[20px] font-medium', active ? 'text-text-accent' : 'text-foreground')}
    >
      {children}
    </Link>
  )
}
