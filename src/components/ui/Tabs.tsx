import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react'

import { cn } from '@/lib/cn'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn('flex flex-wrap items-end gap-6', className)}
      {...props}
    />
  )
})

export const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'text-body-md text-text-secondary hover:text-text-primary data-[state=active]:border-text-accent data-[state=active]:text-text-accent border-b-2 border-transparent pb-2 font-medium transition-colors',
        className,
      )}
      {...props}
    />
  )
})

export const TabsContent = TabsPrimitive.Content
