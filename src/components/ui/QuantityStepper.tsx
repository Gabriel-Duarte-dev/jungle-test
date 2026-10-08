import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/cn'

interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'split' | 'grouped' | 'inline'
  id?: string
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  size = 'md',
  variant = 'split',
  id,
}: QuantityStepperProps) {
  const compact = size === 'sm'
  const buttonSize = compact ? 'w-5 h-[30px]' : 'w-[33px] h-[49.5px]'
  const grouped = variant === 'grouped'
  const inline = variant === 'inline'

  return (
    <div
      className={cn(
        'inline-flex items-center',
        grouped && 'bg-surface-dark rounded-sm',
        inline && 'gap-1',
        !grouped && !inline && 'gap-2',
        compact ? 'h-8' : 'h-10',
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        className={cn(
          'grid place-items-center rounded-[33px]',
          buttonSize,
          grouped || inline ? 'text-text-accent' : 'bg-surface-dark text-text-accent',
        )}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
      >
        <Minus aria-hidden className="size-3.5" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-label="Quantidade"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          'text-body text-text-accent [appearance:textfield] bg-transparent text-center font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          compact ? 'w-8' : 'w-10',
        )}
      />
      <button
        type="button"
        aria-label="Aumentar quantidade"
        className={cn(
          'grid place-items-center rounded-[33px]',
          buttonSize,
          grouped || inline ? 'text-text-accent' : 'bg-primary text-ink',
        )}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
      >
        <Plus aria-hidden className="size-3.5" />
      </button>
    </div>
  )
}
