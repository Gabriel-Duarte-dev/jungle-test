import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary font-bold text-ink hover:bg-text-accent hover:text-ink',
        secondary:
          'border border-border-soft bg-surface-card font-medium text-text-primary hover:border-primary hover:text-text-accent',
        outline:
          'border border-primary bg-transparent font-medium text-text-accent hover:bg-primary hover:text-ink',
        ghost: 'bg-transparent font-medium text-text-secondary hover:text-text-accent',
        danger:
          'border border-danger bg-transparent font-medium text-danger hover:bg-danger hover:text-ink',
      },
      size: {
        sm: 'h-[35px] rounded-sm px-3 text-caption',
        md: 'h-10 rounded-sm px-5 text-body-lg',
        lg: 'h-12 rounded-sm px-6 text-body-lg',
        icon: 'size-10 rounded-sm',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, asChild, loading, children, disabled, ...props },
  ref,
) {
  const merged = cn(buttonVariants({ variant, size, block }), className)

  if (asChild) {
    return (
      <Slot ref={ref} className={merged} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      ref={ref}
      className={merged}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
})

export { buttonVariants }
