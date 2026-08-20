import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
}

function Switch({ checked, onCheckedChange, label, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'focus-ring relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border-strong transition-colors duration-200',
        checked ? 'bg-accent' : 'bg-surface-3',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[17px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

export { Switch }