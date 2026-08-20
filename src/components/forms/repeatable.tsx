import * as React from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RepeatableProps<T extends { id: string }> {
  items: T[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, patch: Partial<T>) => void
  render: (item: T, index: number) => React.ReactNode
  addLabel: string
  emptyLabel?: string
  max?: number
  collapsible?: boolean
}

export function Repeatable<T extends { id: string }>({
  items,
  onAdd,
  onRemove,
  onChange: _onChange,
  render,
  addLabel,
  emptyLabel,
  max,
  collapsible = true,
}: RepeatableProps<T>) {
  const [closedIds, setClosedIds] = React.useState<Set<string>>(() => new Set())
  const atLimit = max !== undefined && items.length >= max

  const toggle = (id: string) => {
    if (!collapsible) return
    setClosedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyLabel && (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-6 text-center text-sm text-subtle">
          {emptyLabel}
        </p>
      )}
      {items.map((item, index) => {
        const open = !collapsible || !closedIds.has(item.id)
        return (
          <div key={item.id} className="rounded-lg border border-border bg-surface-2/50">
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              {collapsible ? (
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="focus-ring flex flex-1 items-center gap-2 text-left text-sm font-medium text-foreground"
                  aria-expanded={open}
                >
                  <ChevronDown
                    className={cn('size-4 text-subtle transition-transform', open && 'rotate-180')}
                  />
                  <span className="truncate">
                    {itemLabel(item, index)}
                  </span>
                </button>
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {itemLabel(item, index)}
                </span>
              )}
              <button
                type="button"
                aria-label="Remove entry"
                onClick={() => onRemove(item.id)}
                className="focus-ring rounded-md p-1.5 text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {open && (
              <div className="border-t border-border px-4 py-4">
                <div className="space-y-4">{render(item, index)}</div>
                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        disabled={atLimit}
        className="w-full"
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}

function itemLabel(item: { id: string } & Record<string, unknown>, index: number) {
  const primary = item.title ?? item.name ?? item.company ?? item.jobTitle ?? item.institution
  if (typeof primary === 'string' && primary.trim()) {
    const secondary =
      typeof item.organization === 'string' && item.organization
        ? item.organization
        : typeof item.institution === 'string' && item.institution
          ? item.institution
          : ''
    return secondary ? `${primary} — ${secondary}` : primary
  }
  return `Entry ${index + 1}`
}