import { formatEth, type EthAmount } from '@/lib/eth'
import { cn } from '@/lib/cn'

interface EthPriceProps {
  value: EthAmount
  compareAt?: EthAmount | null
  className?: string
  compareClassName?: string
  withSymbol?: boolean
  separator?: '.' | ','
}

export function EthPrice({
  value,
  compareAt,
  className,
  compareClassName,
  withSymbol = true,
  separator = '.',
}: EthPriceProps) {
  const current = formatEth(value, { decimals: 2, separator, withSymbol })

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className="text-text-accent font-bold">{current}</span>
      {compareAt && (
        <span className={cn('text-text-secondary line-through', compareClassName)}>
          {formatEth(compareAt, { decimals: 2, separator, withSymbol })}
        </span>
      )}
    </span>
  )
}
