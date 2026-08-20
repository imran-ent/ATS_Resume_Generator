import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  badge?: string
  children: React.ReactNode
}

export function EditorSection({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  badge,
  children,
}: EditorSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="text-subtle">{icon}</span>}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          </div>
          {badge && (
            <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={cn('size-4 shrink-0 text-subtle transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </section>
  )
}