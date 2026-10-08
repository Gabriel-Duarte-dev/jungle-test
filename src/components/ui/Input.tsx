import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

const controlClasses =
  'w-full rounded-sm border border-border-soft px-3 text-body text-text-primary transition-colors placeholder:text-secondary/70 focus-visible:border-primary disabled:opacity-60 aria-invalid:border-danger'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlClasses, 'h-10', className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(controlClasses, 'py-2 leading-6', className)} {...props} />
  )
})

export { controlClasses }
