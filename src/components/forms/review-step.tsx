import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Wand2, Loader2, FileText } from 'lucide-react'
import { useResumeDraft } from '@/hooks/useResumeDraft'
import { StepFooter } from '@/components/forms/step-footer'
import { Field } from '@/components/forms/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ResumePreview } from '@/components/resume/resume-preview'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { TEMPLATES } from '@/data/constants'
import { cn } from '@/lib/utils'
import type { TemplateId } from '@/types/resume'

export function ReviewStep({
  onBack,
}: {
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const navigate = useNavigate()
  const toast = useUiStore((s) => s.toast)
  const [title, setTitle] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  if (!data) return null

  const checks = [
    { label: 'Name & title', ok: !!data.personal.fullName.trim() && !!data.personal.professionalTitle.trim() },
    { label: 'Contact details', ok: !!data.personal.contact.email.trim() },
    { label: 'Professional summary', ok: !!data.summary.trim() },
    { label: 'Work experience', ok: data.experience.length > 0 },
    { label: 'Education', ok: data.education.length > 0 },
    { label: 'Technical skills', ok: data.skills.technical.flatMap((g) => g.skills).length > 0 },
    { label: 'Target role set', ok: !!data.targetJob.role.trim() },
  ]
  const done = checks.filter((c) => c.ok).length

  const saveAndFinish = () => {
    const id = useResumeStore.getState().currentId
    if (!id) return
    const name = title.trim() || `${data.targetJob.role.trim() || 'Untitled'} Resume`
    useResumeStore.getState().setMeta(id, { title: name })
    toast({ title: 'Resume saved', variant: 'success' })
    navigate(`/editor/${id}`)
  }

  const generateSummary = async () => {
    setSummaryLoading(true)
    try {
      const res = await aiProvider.generate({
        resume: data,
        action: 'generate-summary',
        jobDescription: data.targetJob.jobDescription,
      })
      if (res.summary) {
        patch({ summary: res.summary, summarySource: 'ai' })
        toast({ title: 'Summary generated', variant: 'success' })
      }
    } catch (err) {
      toast({
        title: 'Could not generate summary',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable.',
        variant: 'error',
      })
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Review</h2>
        <p className="mt-1 text-sm text-muted">
          Give it a name, pick a template, and polish the summary before you save.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Field label="Resume name" htmlFor="resume-title">
            <Input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={data.targetJob.role ? `${data.targetJob.role} Resume` : 'Untitled Resume'}
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Template</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => patch({ template: t.id as TemplateId })}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    data.template === t.id
                      ? 'border-accent bg-accent-soft'
                      : 'border-border bg-surface-2/50 hover:border-border-strong',
                  )}
                >
                  <p className={cn('text-sm font-semibold', data.template === t.id ? 'text-accent' : 'text-foreground')}>
                    {t.name}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Professional summary</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => void generateSummary()} disabled={summaryLoading}>
                {summaryLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                {summaryLoading ? 'Generating…' : 'AI Generate'}
              </Button>
            </div>
            <Field label="" optional>
              <Textarea
                rows={5}
                value={data.summary}
                onChange={(e) => patch({ summary: e.target.value, summarySource: 'manual' })}
                placeholder="Write a concise summary grounded in your actual experience…"
              />
            </Field>
          </div>

          <div className="rounded-lg border border-border bg-surface-2/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Completeness</p>
              <span className="text-sm font-semibold text-accent">{done}/{checks.length}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${(done / checks.length) * 100}%` }}
              />
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={cn('flex size-4 items-center justify-center rounded-full', c.ok ? 'bg-success/15 text-success' : 'bg-surface-3 text-subtle')}>
                    <Check className="size-2.5" />
                  </span>
                  <span className={c.ok ? 'text-foreground' : 'text-subtle'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Live preview</p>
            <span className="flex items-center gap-1.5 text-xs text-subtle">
              <FileText className="size-3.5" />
              A4 · {data.template}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-surface p-3">
            <ResumePreview data={data} />
          </div>
        </div>
      </div>

      <StepFooter onBack={onBack} onNext={saveAndFinish} nextLabel="Save & Continue" />
    </div>
  )
}