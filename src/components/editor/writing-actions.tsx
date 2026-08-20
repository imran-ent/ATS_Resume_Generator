import { useState } from 'react'
import { Check, ChevronDown, Loader2, Wand2 } from 'lucide-react'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import type { AiRewriteAction } from '@/types/resume'

const ACTIONS: { id: AiRewriteAction; label: string }[] = [
  { id: 'improve', label: 'Improve' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'make-technical', label: 'Make More Technical' },
  { id: 'make-professional', label: 'Make More Professional' },
  { id: 'add-keywords', label: 'Add Keywords' },
  { id: 'fix-grammar', label: 'Fix Grammar' },
]

interface WritingActionsProps {
  text: string
  role?: string
  context?: string
  onResult: (text: string) => void
  disabled?: boolean
}

/** Contextual AI writing assistant menu operating on the selected text. */
export function WritingActions({ text, role, context, onResult, disabled }: WritingActionsProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<AiRewriteAction | null>(null)
  const [preview, setPreview] = useState<{ action: AiRewriteAction; text: string } | null>(null)
  const toast = useUiStore((s) => s.toast)

  const run = async (action: AiRewriteAction) => {
    if (!text.trim()) {
      toast({ title: 'Nothing to rewrite', description: 'Add some text first.', variant: 'info' })
      return
    }
    setBusy(action)
    setPreview(null)
    try {
      const res = await aiProvider.rewrite({ text, action, role, context })
      setPreview({ action, text: res.result })
    } catch (err) {
      toast({
        title: 'Could not rewrite this text',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable. Try again.',
        variant: 'error',
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent-soft px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Wand2 className="size-3.5" />
        AI Writing
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-border-strong bg-surface p-1.5 shadow-xl"
          >
            <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">
              Apply to selected text
            </p>
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="menuitem"
                onClick={() => void run(a.id)}
                disabled={busy !== null}
                className="focus-ring flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                <span>{a.label}</span>
                {busy === a.id && <Loader2 className="size-3.5 animate-spin text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}

      {preview && (
        <div className="mt-2 rounded-md border border-accent/30 bg-accent-soft p-3">
          <p className="text-sm text-foreground">{preview.text}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onResult(preview.text)
                setPreview(null)
                setOpen(false)
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Check className="size-3" />
              Apply
            </button>
            <button type="button" onClick={() => setPreview(null)} className="text-xs text-muted hover:underline">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}