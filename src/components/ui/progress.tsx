import * as React from 'react'
import { cn } from '@/lib/utils'

function Progress({
  value,
  className,
  indicatorClassName,
  label,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: number
  indicatorClassName?: string
  label?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full bg-accent transition-[width] duration-700 ease-out',
          indicatorClassName,
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export { Progress }