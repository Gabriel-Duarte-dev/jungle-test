import { MoreVertical } from 'lucide-react'

import { useLiveRegion } from '@/components/a11y/LiveRegion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { formatEth } from '@/lib/eth'
import { cn } from '@/lib/cn'
import { NETWORK_LABELS, type Network } from '@/services/shared.types'
import {
  type Wallet,
  type WalletProvider,
  WALLET_PROVIDER_LABELS,
} from '@/services/wallets/wallets.types'

const DESKTOP_PROVIDERS: WalletProvider[] = ['metamask', 'walletconnect', 'coinbase']

const MOBILE_PROVIDERS: Array<{ id: WalletProvider; letter: string }> = [
  { id: 'walletconnect', letter: 'W' },
  { id: 'metamask', letter: 'M' },
  { id: 'coinbase', letter: 'C' },
]

interface WalletPickerProps {
  wallets: Wallet[]
  walletId: string
  network: Network
  connection: 'idle' | 'connected' | 'refused' | 'disconnected'
  onWallet: (id: string) => void
  onNetwork: (network: Network) => void
  onConnect: () => void
  mode?: 'all' | 'mobile' | 'desktop'
  totalEth?: string
}

function walletIdentity(wallet: Wallet) {
  const ens = wallet.ens.trim()
  if (ens) return `${ens}${wallet.ensTld}`
  const optional = wallet.optionalEns.trim()
  if (optional) return optional
  if (wallet.address.startsWith('0x') && wallet.address.length > 10) {
    return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
  }
  return wallet.address
}

function networkCaption(network: Network) {
  if (network === 'ethereum') return 'Rede principal Ethereum'
  return `Rede ${NETWORK_LABELS[network]}`
}

export function WalletPicker({
  wallets,
  walletId,
  connection,
  onWallet,
  onNetwork,
  onConnect,
  mode = 'all',
  totalEth,
}: WalletPickerProps) {
  const { announce } = useLiveRegion()
  const selected = wallets.find((wallet) => wallet.id === walletId)
  const showMobile = mode !== 'desktop'
  const showDesktop = mode !== 'mobile'

  function chooseWallet(id: string) {
    const wallet = wallets.find((item) => item.id === id)
    onWallet(id)
    if (wallet) onNetwork(wallet.network)
    onConnect()
  }

  function chooseProvider(provider: WalletProvider) {
    const match = wallets.find((wallet) => wallet.provider === provider)
    if (match) {
      chooseWallet(match.id)
      return
    }
    announce(`Cadastre uma carteira ${WALLET_PROVIDER_LABELS[provider]} em Carteiras.`)
  }

  return (
    <div className="flex flex-col gap-5">
      {showMobile && (
        <div className={mode === 'mobile' ? undefined : 'lg:hidden'}>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-body-lg font-bold text-text-primary">
              {connection === 'connected' ? 'Carteira conectada' : 'Conectar carteira'}
            </p>
            <button
              type="button"
              className="text-caption text-text-accent"
              onClick={() => announce('Escolha outra carteira na lista.')}
            >
              Trocar carteira
            </button>
          </div>
          <RadioGroup value={walletId || undefined} onValueChange={chooseWallet} className="grid gap-3">
            {wallets.map((wallet) => (
              <label
                key={wallet.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 bg-surface-card"
              >
                <RadioGroupItem value={wallet.id} />
                <span className="min-w-0 flex-1">
                  <span className="text-body text-text-primary block font-bold">
                    {wallet.kind === 'primary' ? 'Principal' : 'Reserva'}
                  </span>
                  <span className="sr-only"> {wallet.label} </span>
                  <span className="text-body text-text-secondary block">{walletIdentity(wallet)}</span>
                  <span className="text-caption text-text-secondary block">
                    {networkCaption(wallet.network)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Opções de ${wallet.label}`}
                  className="text-text-secondary grid size-8 shrink-0 place-items-center"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    announce(`Mais opções para ${wallet.label}.`)
                  }}
                >
                  <MoreVertical aria-hidden className="size-4" />
                </button>
              </label>
            ))}
          </RadioGroup>

          <h3 className="text-body-lg text-text-primary mt-8 font-bold">Carteira e rede</h3>
          <RadioGroup
            value={selected?.provider}
            onValueChange={(value) => chooseProvider(value as WalletProvider)}
            className="mt-5 grid gap-5"
          >
            {MOBILE_PROVIDERS.map((provider) => (
              <label key={provider.id} className="flex items-center gap-3 bg-surface-card rounded-xl px-4 py-3.5">
                <span className="border-border-soft text-caption text-text-primary grid size-8 place-items-center rounded-full border font-bold">
                  {provider.letter}
                </span>
                <span className="text-body text-text-primary flex-1">
                  {WALLET_PROVIDER_LABELS[provider.id]}
                </span>
                <RadioGroupItem value={provider.id} />
              </label>
            ))}
          </RadioGroup>

          {totalEth && (
            <p className="text-body-lg text-text-primary mt-8 text-right font-bold">
              Total: <span className='text-text-accent'>{formatEth(totalEth, { withSymbol: true })}</span>
            </p>
          )}
        </div>
      )}

      {showDesktop && (
        <div className={mode === 'desktop' ? undefined : 'hidden lg:block'}>
          <h3 className="text-body-lg text-text-primary mb-4 text-center font-bold">
            Carteira e rede
          </h3>
          <div className="border-border-soft text-caption text-text-secondary mb-3 flex h-12 items-center justify-center gap-2 rounded-sm border px-4 font-bold tracking-wide uppercase">
            {DESKTOP_PROVIDERS.map((provider, index) => {
              const active = selected?.provider === provider && connection === 'connected'
              return (
                <span key={provider} className="inline-flex items-center gap-2">
                  {index > 0 && <span aria-hidden>·</span>}
                  <button
                    type="button"
                    onClick={() => chooseProvider(provider)}
                    className={cn('hover:text-text-accent', active && 'text-text-accent')}
                  >
                    {WALLET_PROVIDER_LABELS[provider]}
                  </button>
                </span>
              )
            })}
          </div>
          <RadioGroup value={walletId || undefined} onValueChange={chooseWallet} className="grid gap-3">
            {wallets.map((wallet) => (
              <label
                key={wallet.id}
                className={cn(
                  'flex h-12 items-center gap-3 rounded-sm border px-4',
                  wallet.id === walletId && connection === 'connected'
                    ? 'border-primary text-text-primary'
                    : 'border-border-soft text-text-primary',
                )}
              >
                <RadioGroupItem value={wallet.id} />
                <span className="text-body">
                  {wallet.label}
                  <span className="sr-only">
                    {' '}
                    {WALLET_PROVIDER_LABELS[wallet.provider]} {wallet.address}
                  </span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      <p role="status" className="sr-only">
        {connection === 'connected' && selected
          ? `Carteira ${selected.label} conectada.`
          : 'Escolha uma carteira para confirmar a compra.'}
      </p>
    </div>
  )
}
