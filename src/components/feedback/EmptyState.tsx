import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'border-border bg-surface-card flex flex-col items-start gap-3 rounded-md border p-8',
        className,
      )}
    >
      <h2 className="text-heading text-text-primary font-bold">{title}</h2>
      <p className="text-body text-text-secondary max-w-lg">{description}</p>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  error: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Não foi possível carregar',
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'Tente novamente em instantes.'

  return (
    <div
      role="alert"
      className={cn(
        'border-danger/40 bg-surface-card flex flex-col items-start gap-3 rounded-md border p-8',
        className,
      )}
    >
      <h2 className="text-heading text-text-primary font-bold">{title}</h2>
      <p className="text-body text-text-secondary max-w-lg">{message}</p>
      {onRetry && (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
