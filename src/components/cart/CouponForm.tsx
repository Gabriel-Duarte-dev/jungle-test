import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'

import { useCouponForm } from './useCouponForm'

export function CouponForm({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { code, error, pending, onCodeChange, onSubmit, onClear, applied } = useCouponForm()

  return (
    <form onSubmit={onSubmit} className="flex items-end">
      <Field
        label="Código promocional"
        labelHidden={variant === 'mobile'}
        error={error}
        className="min-w-0 flex-1"
      >
        {(control) => (
          <Input
            {...control}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="Digite o código promocional..."
            autoComplete="off"
            className="rounded-r-none border-r-0 bg-transparent"
          />
        )}
      </Field>
      <Button type="submit" loading={pending} className="shrink-0 rounded-l-none border-l-0">
        Aplicar
      </Button>
      {applied && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          className="shrink-0 rounded-l-none border-l-0"
        >
          Limpar cupom
        </Button>
      )}
    </form>
  )
}
