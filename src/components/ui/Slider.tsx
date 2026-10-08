import * as SliderPrimitive from '@radix-ui/react-slider'
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react'

import { cn } from '@/lib/cn'

export const Slider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...props }, ref) {
  const count = props.value?.length ?? props.defaultValue?.length ?? 1

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex h-5 w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-border relative h-1 w-full grow rounded-full">
        <SliderPrimitive.Range className="bg-primary absolute h-full rounded-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="border-primary bg-foreground block size-4 rounded-full border-2"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
