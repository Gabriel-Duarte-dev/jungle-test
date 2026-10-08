import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { AccountShell } from '@/components/layout/AccountShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ErrorState } from '@/components/feedback/EmptyState'
import { Skeleton, SkeletonRegion } from '@/components/ui/Skeleton'
import { PAGE_NARROW } from '@/lib/layout'
import {
  useChangePasswordMutation,
  useProfileQuery,
  useRemoveAvatarMutation,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '@/services/profile/profile.queries'
import { errorMessage } from '@/services/http/errors'

const profileSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo (mínimo de 3 caracteres).'),
  handle: z
    .string()
    .regex(/^@[a-z0-9_.]{3,20}$/, 'Use @ seguido de 3 a 20 letras, números, ponto ou underscore.'),
  email: z.string().min(1, 'Informe um e-mail válido.'),
  bio: z.string().max(280, 'A bio deve ter no máximo 280 caracteres.'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: z
      .string()
      .min(8, 'A nova senha precisa ter ao menos 8 caracteres.')
      .regex(/[A-Z]/, 'Use ao menos uma letra maiúscula.')
      .regex(/\d/, 'Use ao menos um número.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

const ENS_TLDS = ['.eth', '.xyz', '.crypto'] as const

export function ProfilePage() {
  useDocumentTitle('Perfil — KURIO')
  const profile = useProfileQuery()
  const update = useUpdateProfileMutation()
  const avatar = useUpdateAvatarMutation()
  const removeAvatar = useRemoveAvatarMutation()
  const password = useChangePasswordMutation()

  if (profile.isLoading) {
    return (
      <SkeletonRegion label="Carregando perfil" className={`${PAGE_NARROW} py-10`}>
        <Skeleton className="h-80 w-full rounded-md" />
      </SkeletonRegion>
    )
  }

  if (profile.isError || !profile.data) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      </div>
    )
  }

  return (
    <AccountShell>
      <div className="flex flex-col gap-10">
        <h1 className="text-heading text-text-primary font-bold">Perfil do colecionador</h1>

        <ProfileFields
          defaultValues={{
            name: profile.data.name,
            handle: profile.data.handle,
            email: profile.data.email,
            bio: profile.data.bio,
          }}
          avatarUrl={profile.data.avatarUrl}
          avatarName={profile.data.name}
          pending={update.isPending}
          avatarPending={avatar.isPending || removeAvatar.isPending}
          onAvatar={(file) => {
            const reader = new FileReader()
            reader.onload = () => {
              avatar.mutate(
                { dataUrl: String(reader.result), fileName: file.name },
                {
                  onSuccess: () => toast.success('Avatar atualizado.'),
                  onError: (error) => toast.error(errorMessage(error)),
                },
              )
            }
            reader.readAsDataURL(file)
          }}
          onRemoveAvatar={() =>
            removeAvatar.mutate(undefined, {
              onSuccess: () => toast.success('Avatar removido.'),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }
          onSubmit={(values) => {
            update.mutate(values, {
              onSuccess: () => toast.success('Perfil atualizado.'),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }}
        />

        <PasswordFields
          pending={password.isPending}
          onSubmit={(values) => {
            password.mutate(values, {
              onSuccess: () => toast.success('Senha alterada.'),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }}
        />
      </div>
    </AccountShell>
  )
}

function ProfileFields({
  defaultValues,
  avatarUrl,
  avatarName,
  pending,
  avatarPending,
  onAvatar,
  onRemoveAvatar,
  onSubmit,
}: {
  defaultValues: ProfileValues
  avatarUrl: string | null
  avatarName: string
  pending: boolean
  avatarPending: boolean
  onAvatar: (file: File) => void
  onRemoveAvatar: () => void
  onSubmit: (values: ProfileValues) => void
}) {
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues })
  const [ens, setEns] = useState('')
  const [ensTld, setEnsTld] = useState<(typeof ENS_TLDS)[number]>('.eth')
  const [walletNickname, setWalletNickname] = useState('')

  return (
    <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <input type="hidden" {...form.register('bio')} />
      <Field label="Nome de exibição" required error={form.formState.errors.name?.message}>
        {(control) => <Input {...control} {...form.register('name')} />}
      </Field>
      <Field label="Nome de usuário" required error={form.formState.errors.handle?.message}>
        {(control) => <Input {...control} {...form.register('handle')} />}
      </Field>
      <Field label="E-mail" required error={form.formState.errors.email?.message}>
        {(control) => <Input {...control} type="email" {...form.register('email')} />}
      </Field>
      <Field label="Nome ENS" required>
        {(control) => (
          <div className="flex gap-2">
            <Input
              {...control}
              value={ens}
              onChange={(event) => setEns(event.target.value)}
              placeholder="nome"
            />
            <Select
              value={ensTld}
              onValueChange={(value) => setEnsTld(value as (typeof ENS_TLDS)[number])}
            >
              <SelectTrigger className="w-24 shrink-0" aria-label="Sufixo ENS">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENS_TLDS.map((tld) => (
                  <SelectItem key={tld} value={tld}>
                    {tld}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Field>
      <Field label="Apelido da carteira" required>
        {(control) => (
          <Input
            {...control}
            value={walletNickname}
            onChange={(event) => setWalletNickname(event.target.value)}
          />
        )}
      </Field>
      <div className="flex flex-col gap-2">
        <p className="text-caption text-text-secondary font-medium">Avatar</p>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${avatarName}`}
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <div className="bg-surface-dark text-body-lg text-text-accent grid size-12 place-items-center rounded-full">
              {avatarName.slice(0, 1)}
            </div>
          )}
          <label className="inline-flex">
            <span className="sr-only">Enviar avatar</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onAvatar(file)
              }}
            />
            <Button type="button" size="sm" asChild>
              <span>Alterar</span>
            </Button>
          </label>
          {avatarUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              loading={avatarPending}
              onClick={onRemoveAvatar}
            >
              Remover
            </Button>
          )}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          Salvar
        </Button>
      </div>
    </form>
  )
}

function PasswordFields({
  pending,
  onSubmit,
}: {
  pending: boolean
  onSubmit: (values: PasswordValues) => void
}) {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  return (
    <form className="flex max-w-xl flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <h2 className="text-body-xl font-bold">Alterar senha</h2>
      <Field label="Senha atual" required error={form.formState.errors.currentPassword?.message}>
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="current-password"
            {...form.register('currentPassword')}
          />
        )}
      </Field>
      <Field label="Nova senha" required error={form.formState.errors.newPassword?.message}>
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="new-password"
            {...form.register('newPassword')}
          />
        )}
      </Field>
      <Field
        label="Confirmar nova senha"
        required
        error={form.formState.errors.confirmPassword?.message}
      >
        {(control) => (
          <PasswordInput
            {...control}
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
        )}
      </Field>
      <Button type="submit" variant="secondary" loading={pending}>
        Atualizar senha
      </Button>
    </form>
  )
}
