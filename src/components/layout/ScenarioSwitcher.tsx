import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  useResetScenarioMutation,
  useScenarioQuery,
  useSelectScenarioMutation,
} from '@/services/mock/mock.queries'

export function ScenarioSwitcher() {
  const { data } = useScenarioQuery()
  const select = useSelectScenarioMutation()
  const reset = useResetScenarioMutation()
  const [open, setOpen] = useState(false)

  if (!data) return null

  return (
    <div className="fixed right-4 bottom-28 z-40 lg:bottom-4">
      {open && (
        <div className="border-border bg-surface-card mb-2 w-[min(100vw-2rem,22rem)] rounded-md border p-4 shadow-xl">
          <p className="text-body text-text-primary font-bold">Simulação</p>
          <p className="text-caption text-text-secondary mt-1">{data.active.description}</p>
          <label className="text-caption text-text-secondary mt-3 block" htmlFor="scenario-select">
            Cenário
          </label>
          <select
            id="scenario-select"
            className="border-border-soft bg-surface-dark text-caption text-text-primary mt-1 h-10 w-full rounded-sm border px-2"
            value={data.active.id}
            onChange={(event) => select.mutate(event.target.value)}
          >
            {data.available.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => reset.mutate()}
            loading={reset.isPending}
          >
            Restaurar cenário
          </Button>
        </div>
      )}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Fechar simulação' : `Simulação: ${data.active.label}`}
      </Button>
    </div>
  )
}
