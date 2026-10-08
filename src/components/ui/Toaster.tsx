import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-surface-card border-border text-text-primary font-mono',
          title: 'text-body text-text-primary',
          description: 'text-caption text-text-secondary',
          success: 'border-text-accent',
          error: 'border-danger',
        },
      }}
    />
  )
}
