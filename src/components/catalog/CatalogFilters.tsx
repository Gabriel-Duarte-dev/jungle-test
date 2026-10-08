import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { formatEth } from '@/lib/eth'
import { NETWORK_LABELS, type Network } from '@/services/shared.types'

import { useCatalogFilters } from './useCatalogFilters'

const checkboxClassName = 'size-4.5 shrink-0 accent-[var(--color-primary)]'

export function CatalogFilters() {
  const {
    collections,
    networks,
    selectedCollections,
    selectedNetworks,
    range,
    bounds,
    onToggleCollection,
    onToggleNetwork,
    onRangeChange,
    onApplyPrice,
    onClear,
  } = useCatalogFilters()

  return (
    <aside className="flex w-full flex-col gap-8 lg:w-[310px]">
      <div className="bg-surface-card rounded-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-subtitle text-foreground font-bold">Filtros</h2>
          <button type="button" className="text-caption text-text-accent" onClick={onClear}>
            Limpar
          </button>
        </div>

        <section aria-labelledby="filtro-colecoes">
          <h3 id="filtro-colecoes" className="text-subtitle text-foreground mb-3 font-bold">
            Coleções
          </h3>
          <ul className="flex flex-col px-3">
            {collections.map((option) => {
              const active = selectedCollections.includes(option.id)
              return (
                <li key={option.id}>
                  <label
                    className={cn(
                      'text-body-md flex h-10 cursor-pointer items-center justify-between gap-3',
                      active ? 'text-text-accent' : 'text-text-secondary',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={active}
                        onChange={() => onToggleCollection(option.id)}
                      />
                      <span>{option.label}</span>
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        active ? 'text-text-accent' : 'text-text-secondary',
                      )}
                    >
                      ({option.count})
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="filtro-preco" className="mt-10">
          <h3 id="filtro-preco" className="text-subtitle text-foreground mb-3 font-bold">
            Faixa de preço
          </h3>
          <div className="flex flex-col gap-3 pl-3">
            <Slider
              min={bounds[0]}
              max={bounds[1]}
              step={1}
              value={range}
              onValueChange={onRangeChange}
              aria-label="Faixa de preço em centavos de ETH"
            />
            <p className="text-body-md text-foreground">
              Preço: {formatEth(fromCents(range[0]), { separator: ',', decimals: 2 })} -{' '}
              {formatEth(fromCents(range[1]), { separator: ',', decimals: 2 })} ETH
            </p>
            <Button type="button" size="sm" className="text-body-lg w-fit" onClick={onApplyPrice}>
              Aplicar
            </Button>
          </div>
        </section>

        <section aria-labelledby="filtro-rede" className="mt-10">
          <h3 id="filtro-rede" className="text-subtitle text-foreground mb-3 font-bold">
            Rede
          </h3>
          <ul className="flex flex-col pl-3">
            {networks.map((option) => {
              const active = selectedNetworks.includes(option.id as Network)
              const label = NETWORK_LABELS[option.id as keyof typeof NETWORK_LABELS] ?? option.label
              return (
                <li key={option.id}>
                  <label
                    className={cn(
                      'text-body-md flex h-10 cursor-pointer items-center justify-between gap-3',
                      active ? 'text-text-accent' : 'text-text-secondary',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={active}
                        onChange={() => onToggleNetwork(option.id as Network)}
                      />
                      <span>{label}</span>
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        active ? 'text-text-accent' : 'text-text-secondary',
                      )}
                    >
                      ({option.count})
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </aside>
  )
}

function fromCents(cents: number) {
  return (cents / 100).toFixed(2)
}
