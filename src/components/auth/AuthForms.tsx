import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'

import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useLoginMutation, useRegisterMutation } from '@/services/auth/auth.queries'
import { isApiError } from '@/services/http/errors'

import { AuthSocial } from './AuthSocial'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'Informe seu nome completo (mínimo de 3 caracteres).'),
    email: z.string().min(1, 'Informe um e-mail válido.'),
    password: z
      .string()
      .min(8, 'A senha precisa ter ao menos 8 caracteres.')
      .regex(/[A-Z]/, 'Use ao menos uma letra maiúscula.')
      .regex(/\d/, 'Use ao menos um número.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function useFromPath() {
  const search = useSearch({ strict: false, shouldThrow: false }) as { from?: string }
  return search.from || '/'
}

export function LoginForm({ compact }: { compact?: boolean }) {
  const navigate = useNavigate()
  const from = useFromPath()
  const login = useLoginMutation()
  const { announce } = useLiveRegion()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const fieldClass = compact ? 'h-10 rounded-[5px]' : 'h-[50px] rounded-[5px]'

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={form.handleSubmit((values) => {
        login.mutate(values, {
          onSuccess: () => {
            void navigate({ to: from })
          },
          onError: (error) => {
            if (isApiError(error) && error.fields) {
              for (const [name, message] of Object.entries(error.fields)) {
                form.setError(name as keyof LoginValues, { message })
              }
            }
            toast.error(isApiError(error) ? error.message : 'Não foi possível entrar.')
          },
        })
      })}
    >
      <Field
        label="E-mail"
        required
        labelHidden={compact}
        error={form.formState.errors.email?.message}
      >
        {(control) => (
          <Input
            {...control}
            type="email"
            autoComplete="email"
            placeholder="contato@email.com"
            className={fieldClass}
            {...form.register('email')}
          />
        )}
      </Field>
      <Field
        label="Senha"
        required
        labelHidden={compact}
        error={form.formState.errors.password?.message}
      >
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="current-password"
            placeholder="Senha"
            className={fieldClass}
            {...form.register('password')}
          />
        )}
      </Field>
      <button
        type="button"
        className="text-body text-text-accent self-end"
        onClick={() => announce('A recuperação de senha está fora do escopo desta entrega.')}
      >
        Esqueceu a senha?
      </button>
      <Button
        type="submit"
        loading={login.isPending}
        className={compact ? 'mt-3 h-[45px]' : 'mt-6 h-[60px]'}
      >
        Entrar
      </Button>
    </form>
  )
}

export function RegisterForm({ compact }: { compact?: boolean }) {
  const navigate = useNavigate()
  const from = useFromPath()
  const register = useRegisterMutation()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })
  const fieldClass = compact ? 'h-10 rounded-[5px]' : 'h-[50px] rounded-[5px]'

  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={form.handleSubmit((values) => {
        register.mutate(
          { name: values.name, email: values.email, password: values.password },
          {
            onSuccess: () => {
              void navigate({ to: from })
            },
            onError: (error) => {
              if (isApiError(error) && error.fields) {
                for (const [name, message] of Object.entries(error.fields)) {
                  form.setError(name as keyof RegisterValues, { message })
                }
              }
              toast.error(isApiError(error) ? error.message : 'Não foi possível criar a conta.')
            },
          },
        )
      })}
    >
      <Field
        label="Nome"
        required
        labelHidden={compact}
        error={form.formState.errors.name?.message}
      >
        {(control) => (
          <Input
            {...control}
            autoComplete="name"
            placeholder="Nome de usuário"
            className={fieldClass}
            {...form.register('name')}
          />
        )}
      </Field>
      <Field
        label="E-mail"
        required
        labelHidden={compact}
        error={form.formState.errors.email?.message}
      >
        {(control) => (
          <Input
            {...control}
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            className={fieldClass}
            {...form.register('email')}
          />
        )}
      </Field>
      <Field
        label="Senha"
        required
        labelHidden={compact}
        error={form.formState.errors.password?.message}
      >
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="new-password"
            placeholder="Senha"
            className={fieldClass}
            {...form.register('password')}
          />
        )}
      </Field>
      <Field
        label="Confirmar senha"
        required
        labelHidden={compact}
        error={form.formState.errors.confirmPassword?.message}
      >
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="new-password"
            placeholder="Confirmar senha"
            className={fieldClass}
            {...form.register('confirmPassword')}
          />
        )}
      </Field>
      <Button
        type="submit"
        loading={register.isPending}
        className={compact ? 'mt-3 h-[45px]' : 'mt-6 h-[60px]'}
      >
        {compact ? 'Criar conta' : 'Criar perfil'}
      </Button>
    </form>
  )
}

export { AuthSocial }
