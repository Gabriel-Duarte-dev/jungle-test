import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

export const RadioGroup = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />
})

export const RadioGroupItem = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'border-border-soft bg-surface-dark data-[state=checked]:border-primary flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="bg-primary size-2.5 rounded-full" />
    </RadioGroupPrimitive.Item>
  )
})
