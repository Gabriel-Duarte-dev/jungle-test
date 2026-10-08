import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { AccountShell } from '@/components/layout/AccountShell'
import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { PAGE_NARROW } from '@/lib/layout'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ErrorState } from '@/components/feedback/EmptyState'
import { Skeleton, SkeletonRegion } from '@/components/ui/Skeleton'
import { NETWORK_LABELS, type Network } from '@/services/shared.types'
import {
  WALLET_PROVIDER_LABELS,
  type Wallet,
  type WalletKind,
  type WalletPayload,
} from '@/services/wallets/wallets.types'
import {
  useCreateWalletMutation,
  useUpdateWalletMutation,
  useWalletsQuery,
} from '@/services/wallets/wallets.queries'
import { errorMessage, isApiError } from '@/services/http/errors'

const schema = z.object({
  label: z.string().trim().min(3, 'Dê um nome com ao menos 3 caracteres para a carteira.'),
  address: z.string().min(1, 'Informe o endereço da carteira.'),
  network: z.enum(['ethereum', 'polygon', 'solana']),
  kind: z.enum(['primary', 'secondary']),
  provider: z.enum(['metamask', 'walletconnect', 'coinbase']),
  displayName: z.string().trim(),
  profileName: z.string().trim(),
  referral: z.string().trim(),
  email: z.union([z.string().email('Informe um e-mail válido.'), z.literal('')]),
  ens: z.string().trim(),
  ensTld: z.enum(['.eth', '.xyz', '.crypto']),
  optionalEns: z.string().trim(),
})

type WalletValues = z.infer<typeof schema>

const ENS_TLDS = ['.eth', '.xyz', '.crypto'] as const

export function WalletsPage() {
  useDocumentTitle('Carteiras — KURIO')
  const wallets = useWalletsQuery()
  const create = useCreateWalletMutation()
  const update = useUpdateWalletMutation()
  const { announce } = useLiveRegion()
  const [showSecondaryForm, setShowSecondaryForm] = useState(false)
  const [sameAsPrimary, setSameAsPrimary] = useState(false)

  if (wallets.isLoading) {
    return (
      <SkeletonRegion label="Carregando carteiras" className={`${PAGE_NARROW} py-10`}>
        <Skeleton className="h-64 w-full rounded-md" />
      </SkeletonRegion>
    )
  }

  if (wallets.isError) {
    return (
      <div className={`${PAGE_NARROW} py-16`}>
        <ErrorState error={wallets.error} onRetry={() => void wallets.refetch()} />
      </div>
    )
  }

  const primary = wallets.data?.find((wallet) => wallet.kind === 'primary')
  const secondary = wallets.data?.find((wallet) => wallet.kind === 'secondary')

  function persist(kind: WalletKind, existing: Wallet | undefined, values: WalletValues) {
    const payload: WalletPayload = { ...values, kind }

    return new Promise<void>((resolve, reject) => {
      const onError = (error: unknown) => reject(error)

      if (existing) {
        update.mutate(
          { walletId: existing.id, payload },
          {
            onSuccess: () => {
              toast.success('Carteira atualizada.')
              resolve()
            },
            onError,
          },
        )
        return
      }

      create.mutate(payload, {
        onSuccess: () => {
          toast.success('Carteira cadastrada.')
          if (kind === 'secondary') setShowSecondaryForm(false)
          resolve()
        },
        onError,
      })
    })
  }

  return (
    <AccountShell>
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-heading text-text-primary font-bold">Carteira principal</h1>
              <p className="text-body text-text-secondary mt-2">
                Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
              </p>
            </div>
            <button
              type="button"
              className="text-body text-text-accent hover:text-primary shrink-0 font-medium"
              onClick={() =>
                announce('Formulário pronto para cadastrar uma nova carteira principal.')
              }
            >
              Adicionar
            </button>
          </div>
          <WalletForm
            key={primary?.id ?? 'primary-new'}
            defaultValues={valuesFromWallet(primary, 'primary')}
            pending={create.isPending || update.isPending}
            onSubmit={(values) => persist('primary', primary, values)}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-heading text-text-primary font-bold">Carteira secundária</h2>
              {!secondary && !showSecondaryForm && (
                <p className="text-body text-text-secondary mt-2">
                  Você ainda não adicionou uma carteira secundária.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <RadioGroup
                value={sameAsPrimary ? 'same' : undefined}
                onValueChange={() => {
                  setSameAsPrimary(true)
                  announce('A carteira secundária ficará igual à carteira principal.')
                }}
                className="flex items-center"
              >
                <label className="text-body text-text-primary flex items-center gap-2">
                  <RadioGroupItem value="same" />
                  Igual à carteira principal
                </label>
              </RadioGroup>
              <button
                type="button"
                className="text-body text-text-accent hover:text-primary font-medium"
                onClick={() => {
                  setShowSecondaryForm(true)
                  setSameAsPrimary(false)
                  announce('Formulário da carteira secundária aberto.')
                }}
              >
                Adicionar
              </button>
            </div>
          </div>

          {secondary && !showSecondaryForm && (
            <p className="text-body text-text-secondary">
              {secondary.label} · {secondary.address}
            </p>
          )}

          {showSecondaryForm && (
            <WalletForm
              key={secondary?.id ?? 'secondary-new'}
              defaultValues={
                sameAsPrimary && primary
                  ? { ...valuesFromWallet(primary, 'secondary'), label: `${primary.label} (cópia)` }
                  : valuesFromWallet(secondary, 'secondary')
              }
              pending={create.isPending || update.isPending}
              onSubmit={(values) => persist('secondary', secondary, values)}
            />
          )}
        </section>
      </div>
    </AccountShell>
  )
}

function valuesFromWallet(wallet: Wallet | undefined, kind: WalletKind): WalletValues {
  return {
    label: wallet?.label ?? '',
    address: wallet?.address ?? '',
    network: wallet?.network ?? 'ethereum',
    kind,
    provider: wallet?.provider ?? 'metamask',
    displayName: wallet?.displayName ?? '',
    profileName: wallet?.profileName ?? '',
    referral: wallet?.referral ?? '',
    email: wallet?.email ?? '',
    ens: wallet?.ens ?? '',
    ensTld: wallet?.ensTld ?? '.eth',
    optionalEns: wallet?.optionalEns ?? '',
  }
}

function WalletForm({
  defaultValues,
  pending,
  onSubmit,
}: {
  defaultValues: WalletValues
  pending: boolean
  onSubmit: (values: WalletValues) => Promise<void>
}) {
  const form = useForm<WalletValues>({ resolver: zodResolver(schema), defaultValues })

  async function submit(values: WalletValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(isApiError(error) ? error.message : errorMessage(error))
      if (!isApiError(error) || !error.fields) return

      for (const [name, message] of Object.entries(error.fields)) {
        if (name in schema.shape) {
          form.setError(name as keyof WalletValues, { type: 'server', message })
        }
      }
    }
  }

  return (
    <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
      <input type="hidden" {...form.register('kind')} />
      <Field label="Nome de exibição" required error={form.formState.errors.displayName?.message}>
        {(control) => <Input {...control} {...form.register('displayName')} autoComplete="name" />}
      </Field>
      <Field label="Apelido da carteira" required error={form.formState.errors.label?.message}>
        {(control) => <Input {...control} {...form.register('label')} />}
      </Field>
      <Field label="Rede" required error={form.formState.errors.network?.message}>
        {(control) => (
          <Controller
            control={form.control}
            name="network"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={control.id}>
                  <SelectValue placeholder="Selecione uma rede" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(NETWORK_LABELS) as Network[]).map((network) => (
                    <SelectItem key={network} value={network}>
                      {NETWORK_LABELS[network]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>
      <Field label="Nome do perfil" required error={form.formState.errors.profileName?.message}>
        {(control) => <Input {...control} {...form.register('profileName')} />}
      </Field>
      <Field label="Endereço da carteira" required error={form.formState.errors.address?.message}>
        {(control) => (
          <Input {...control} {...form.register('address')} placeholder="Endereço 0x da carteira" />
        )}
      </Field>
      <Field label="ENS ou carteira secundária" labelHidden reserveLabel>
        {(control) => (
          <Input
            {...control}
            {...form.register('optionalEns')}
            placeholder="ENS ou carteira secundária (opcional)"
          />
        )}
      </Field>
      <Field label="Tipo de carteira" required error={form.formState.errors.provider?.message}>
        {(control) => (
          <Controller
            control={form.control}
            name="provider"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={control.id}>
                  <SelectValue placeholder="Selecione uma carteira" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(WALLET_PROVIDER_LABELS) as Array<
                      keyof typeof WALLET_PROVIDER_LABELS
                    >
                  ).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {WALLET_PROVIDER_LABELS[provider]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>
      <Field label="Código de indicação" required error={form.formState.errors.referral?.message}>
        {(control) => <Input {...control} {...form.register('referral')} />}
      </Field>
      <Field label="E-mail" required error={form.formState.errors.email?.message}>
        {(control) => (
          <Input {...control} type="email" {...form.register('email')} autoComplete="email" />
        )}
      </Field>
      <Field label="Nome ENS" required error={form.formState.errors.ens?.message}>
        {(control) => (
          <div className="flex gap-2">
            <Controller
              control={form.control}
              name="ensTld"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            <Input {...control} {...form.register('ens')} placeholder="nome" />
          </div>
        )}
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          Salvar carteira
        </Button>
      </div>
    </form>
  )
}
