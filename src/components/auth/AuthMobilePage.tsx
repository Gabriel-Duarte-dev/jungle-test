import { Link, useSearch } from '@tanstack/react-router'

import { AuthSocial } from './AuthSocial'
import { LoginForm, RegisterForm } from './AuthForms'

interface AuthMobilePageProps {
  mode: 'login' | 'register'
}

export function AuthMobilePage({ mode }: AuthMobilePageProps) {
  const search = useSearch({ strict: false, shouldThrow: false }) as { from?: string }
  const from = search.from

  return (
    <div className="mx-auto flex min-h-[min(100dvh,56rem)] w-full max-w-[414px] flex-col px-7 py-20">
      <p className="tracking-wordmark text-foreground text-center text-[42px] font-bold">KURIO</p>
      <h1 className="text-body-lg text-foreground mt-10 text-center font-medium">
        {mode === 'login' ? 'Entrar' : 'Criar perfil de colecionador'}
      </h1>
      <div className="mt-10">{mode === 'login' ? <LoginForm /> : <RegisterForm />}</div>
      <div className="mt-10">
        <AuthSocial />
      </div>
      <p className="text-body text-text-secondary mt-auto pt-10 text-center">
        {mode === 'login' ? (
          <>
            Novo na Kurio?{' '}
            <Link to="/cadastro" search={from ? { from } : undefined} className="text-text-accent">
              Crie uma conta
            </Link>
          </>
        ) : (
          <>
            Já tem uma conta?{' '}
            <Link to="/entrar" search={from ? { from } : undefined} className="text-text-accent">
              Entre
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
