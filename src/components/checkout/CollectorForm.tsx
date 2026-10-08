import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { NETWORK_LABELS, type Network } from '@/services/shared.types'
import { type WalletProvider } from '@/services/wallets/wallets.types'
import { type OrderCollector } from '@/services/orders/orders.types'

const schema = z.object({
  fullName: z.string().trim().min(3, 'Informe o nome completo do colecionador.'),
  email: z.string().email('Informe um e-mail válido.'),
})

const WALLET_TYPES: Array<{ id: WalletProvider; label: string }> = [
  { id: 'metamask', label: 'MetaMask' },
  { id: 'walletconnect', label: 'WalletConnect' },
  { id: 'coinbase', label: 'Coinbase' },
]

const ENS_TLDS = ['.eth', '.xyz', '.crypto'] as const

interface CollectorFormProps {
  defaultValues: OrderCollector
  username?: string
  onChange: (value: OrderCollector) => void
  errors?: Record<string, string>
}

export function CollectorForm({
  defaultValues,
  username = '',
  onChange,
  errors,
}: CollectorFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultValues.fullName,
      email: defaultValues.email,
    },
    mode: 'onBlur',
  })
  const [extras, setExtras] = useState({
    username,
    network: '' as Network | '',
    profileName: '',
    walletAddress: '',
    secondaryWallet: '',
    walletType: '' as WalletProvider | '',
    referral: '',
    ens: '.eth' as (typeof ENS_TLDS)[number],
    useOtherWallet: false,
    notes: '',
  })

  function emit() {
    const values = form.getValues()
    onChange({
      fullName: values.fullName,
      email: values.email,
      document: defaultValues.document ?? '',
      phone: defaultValues.phone ?? '',
    })
  }

  return (
    <form className="hidden grid-cols-2 gap-4 lg:grid" onChange={emit} onBlur={emit}>
      <Field
        label="Nome de exibição"
        required
        error={form.formState.errors.fullName?.message ?? errors?.['collector.fullName']}
      >
        {(control) => <Input {...control} {...form.register('fullName')} autoComplete="name" />}
      </Field>
      <Field label="Nome de usuário" required>
        {(control) => (
          <Input
            {...control}
            value={extras.username}
            onChange={(event) =>
              setExtras((current) => ({ ...current, username: event.target.value }))
            }
            autoComplete="username"
          />
        )}
      </Field>
      <Field label="Rede" required>
        {(control) => (
          <Select
            value={extras.network || undefined}
            onValueChange={(value) =>
              setExtras((current) => ({ ...current, network: value as Network }))
            }
          >
            <SelectTrigger id={control.id}>
              <SelectValue placeholder="Selecione a rede" />
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
      </Field>
      <Field label="Nome do perfil" required>
        {(control) => (
          <Input
            {...control}
            value={extras.profileName}
            onChange={(event) =>
              setExtras((current) => ({ ...current, profileName: event.target.value }))
            }
          />
        )}
      </Field>
      <Field label="Endereço da carteira" required>
        {(control) => (
          <Input
            {...control}
            value={extras.walletAddress}
            onChange={(event) =>
              setExtras((current) => ({ ...current, walletAddress: event.target.value }))
            }
          />
        )}
      </Field>
      <Field label="Carteira secundária" required>
        {(control) => (
          <Input
            {...control}
            value={extras.secondaryWallet}
            onChange={(event) =>
              setExtras((current) => ({ ...current, secondaryWallet: event.target.value }))
            }
          />
        )}
      </Field>
      <Field label="Tipo de carteira" required>
        {(control) => (
          <Select
            value={extras.walletType || undefined}
            onValueChange={(value) =>
              setExtras((current) => ({ ...current, walletType: value as WalletProvider }))
            }
          >
            <SelectTrigger id={control.id}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {WALLET_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label="Código de indicação" required>
        {(control) => (
          <Input
            {...control}
            value={extras.referral}
            onChange={(event) =>
              setExtras((current) => ({ ...current, referral: event.target.value }))
            }
          />
        )}
      </Field>
      <Field
        label="E-mail"
        required
        error={form.formState.errors.email?.message ?? errors?.['collector.email']}
      >
        {(control) => (
          <Input {...control} type="email" {...form.register('email')} autoComplete="email" />
        )}
      </Field>
      <Field label="Nome ENS" required>
        {(control) => (
          <Select
            value={extras.ens}
            onValueChange={(value) =>
              setExtras((current) => ({ ...current, ens: value as (typeof ENS_TLDS)[number] }))
            }
          >
            <SelectTrigger id={control.id} className="w-24">
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
      </Field>
      <label className="text-body text-text-secondary col-span-2 flex items-center gap-3">
        <Checkbox
          checked={extras.useOtherWallet}
          onCheckedChange={(checked) =>
            setExtras((current) => ({ ...current, useOtherWallet: checked === true }))
          }
        />
        Usar outra carteira?
      </label>
      <Field label="Observação" className="col-span-2">
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            value={extras.notes}
            onChange={(event) =>
              setExtras((current) => ({ ...current, notes: event.target.value }))
            }
          />
        )}
      </Field>
    </form>
  )
}
