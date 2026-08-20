import { useState } from 'react'
import { Check, Loader2, Wand2, X } from 'lucide-react'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import type { AiImproveBulletRequest } from '@/types/resume'

interface BulletsEditorWithAIProps {
  value: string[]
  onChange: (next: string[]) => void
  context: AiImproveBulletRequest['context']
  jobDescription?: string
  label?: string
  placeholder?: string
}

/** Bullet list with one-click "Improve with AI" per bullet. */
export function BulletsEditorWithAI({
  value,
  onChange,
  context,
  jobDescription,
  label = 'Bullet points',
  placeholder = 'Describe what you did, how, and the tools involved…',
}: BulletsEditorWithAIProps) {
  const [draft, setDraft] = useState('')
  const [busyIdx, setBusyIdx] = useState<number | null>(null)
  const [preview, setPreview] = useState<{ idx: number; text: string } | null>(null)
  const toast = useUiStore((s) => s.toast)

  const commit = () => {
    const b = draft.trim()
    if (b && !value.includes(b)) onChange([...value, b])
    setDraft('')
  }

  const improve = async (idx: number) => {
    const bullet = value[idx]
    if (!bullet) return
    setBusyIdx(idx)
    setPreview(null)
    try {
      const res = await aiProvider.improveBullet({ bullet, context, jobDescription })
      setPreview({ idx, text: res.improved })
    } catch (err) {
      toast({
        title: 'Could not improve this bullet',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable. Try again.',
        variant: 'error',
      })
    } finally {
      setBusyIdx(null)
    }
  }

  const applyPreview = () => {
    if (!preview) return
    onChange(value.map((b, i) => (i === preview.idx ? preview.text : b)))
    setPreview(null)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted">{label}</p>
      <ul className="space-y-1.5">
        {value.map((b, i) => (
          <li key={i} className="group rounded-md border border-border bg-surface-2 px-3 py-2">
            <div className="flex items-start gap-2">
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
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 pl-4">
              {busyIdx === i ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-accent">
                  <Loader2 className="size-3 animate-spin" />
                  Improving…
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void improve(i)}
                  className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent-soft"
                >
                  <Wand2 className="size-3" />
                  Improve with AI
                </button>
              )}
            </div>
            {preview?.idx === i && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/30 bg-accent-soft px-3 py-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{preview.text}</p>
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={applyPreview}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="text-xs text-muted hover:underline"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}
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