import { Drawer as DrawerPrimitive } from 'vaul'
import { type ComponentPropsWithoutRef } from 'react'

import { cn } from '@/lib/cn'

export const Sheet = DrawerPrimitive.Root
export const SheetTrigger = DrawerPrimitive.Trigger
export const SheetClose = DrawerPrimitive.Close
export const SheetTitle = DrawerPrimitive.Title
export const SheetDescription = DrawerPrimitive.Description

export function SheetContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70" />
      <DrawerPrimitive.Content
        className={cn(
          'border-border bg-surface-card fixed right-0 bottom-0 left-0 z-50 mt-24 flex max-h-[90vh] flex-col rounded-t-md border p-6',
          className,
        )}
        {...props}
      >
        <div className="bg-border-soft mx-auto mb-4 h-1 w-12 rounded-full" aria-hidden />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
}
