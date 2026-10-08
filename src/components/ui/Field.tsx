import { useId } from 'react'

import { cn } from '@/lib/cn'

export interface FieldControlProps {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  labelHidden?: boolean
  reserveLabel?: boolean
  children: (control: FieldControlProps) => React.ReactNode
}

export function Field({
  label,
  error,
  hint,
  required,
  className,
  labelHidden,
  reserveLabel,
  children,
}: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-caption text-text-primary font-medium',
          labelHidden && (reserveLabel ? 'invisible' : 'sr-only'),
        )}
      >
        {label}
        {required && (
          <span className="text-text-accent ml-1" aria-hidden>
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}

      {hint && (
        <p id={hintId} className="text-caption text-secondary">
          {hint}
        </p>
      )}

      {error && (
        <p role="alert" className="text-caption text-danger flex items-start gap-1.5">
          <span aria-hidden>!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
