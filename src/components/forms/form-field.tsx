import * as React from 'react'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/* ─── Labeled field wrapper ──────────────────────────────────────────── */

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  optional?: boolean
  children: React.ReactNode
  className?: string
}

export function Field({ label, htmlFor, error, hint, optional, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>
          {label}
          {optional && <span className="ml-1 text-xs font-normal text-subtle">(optional)</span>}
        </Label>
        {hint && <span className="text-xs text-subtle">{hint}</span>}
      </div>
      {children}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function TextField({
  label,
  error,
  optional,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; optional?: boolean }) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <Field label={label} htmlFor={inputId} error={error} optional={optional} className={className}>
      <Input id={inputId} aria-invalid={!!error} {...props} />
    </Field>
  )
}

export function TextAreaField({
  label,
  error,
  optional,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; optional?: boolean }) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <Field label={label} htmlFor={inputId} error={error} optional={optional} className={className}>
      <Textarea id={inputId} aria-invalid={!!error} {...props} />
    </Field>
  )
}

export function MonthField({
  label,
  error,
  optional,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; optional?: boolean }) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <Field label={label} htmlFor={inputId} error={error} optional={optional} className={className}>
      <Input type="month" id={inputId} aria-invalid={!!error} {...props} />
    </Field>
  )
}

/* ─── Tags input ─────────────────────────────────────────────────────── */

export function TagsInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  ariaLabel = 'Add item',
  className,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
}) {
  const [draft, setDraft] = React.useState('')

  const commit = () => {
    const tag = draft.trim().replace(/,$/, '')
    if (tag && !value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1.5" aria-label={ariaLabel}>
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="rounded p-0.5 text-subtle transition-colors hover:text-danger"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="focus-ring h-9 w-full rounded-md border border-border-strong bg-surface-2 px-3 text-sm text-foreground placeholder:text-subtle"
      />
    </div>
  )
}

/* ─── Bullets editor ─────────────────────────────────────────────────── */

export function BulletsEditor({
  value,
  onChange,
  label = 'Bullet points',
  placeholder = 'Describe what you did, how, and the tools involved…',
}: {
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  placeholder?: string
}) {
  const [draft, setDraft] = React.useState('')

  const commit = () => {
    const b = draft.trim()
    if (b && !value.includes(b)) onChange([...value, b])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted">{label}</p>
      <ul className="space-y-1.5">
        {value.map((b, i) => (
          <li key={i} className="group flex items-start gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
            <span className="mt-0.5 text-xs text-accent">•</span>
            <span className="flex-1 text-sm text-foreground">{b}</span>
            <button
              type="button"
              aria-label="Remove bullet"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="mt-0.5 rounded p-0.5 text-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            commit()
          }
        }}
        onBlur={commit}
        placeholder={`${placeholder} Press Ctrl+Enter to add.`}
        className="focus-ring min-h-[60px] w-full rounded-md border border-border-strong bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-subtle"
      />
    </div>
  )
}