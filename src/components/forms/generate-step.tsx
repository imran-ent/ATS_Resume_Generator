import { useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'
import { useResumeDraft } from '@/hooks/useResumeDraft'
import { StepFooter } from '@/components/forms/step-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import { useAiStore } from '@/store/aiStore'
import { AI_LOADING_STATES } from '@/data/constants'
import type { ResumeData } from '@/types/resume'

type PipelineItem = { label: string; applied: boolean }

export function GenerateStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, update } = useResumeDraft()
  const toast = useUiStore((s) => s.toast)
  const aiStatus = useAiStore((s) => s.status)
  const aiStart = useAiStore((s) => s.start)
  const aiSucceed = useAiStore((s) => s.succeed)
  const aiFail = useAiStore((s) => s.fail)
  const aiReset = useAiStore((s) => s.reset)

  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [loadingIdx, setLoadingIdx] = useState<number>(0)
  const [completed, setCompleted] = useState(false)

  const runStep = async (
    label: string,
    request: Parameters<typeof aiProvider.generate>[0],
  ): Promise<void> => {
    aiStart(label, label)
    setPipeline((prev) => [...prev, { label, applied: false }])
    try {
      const res = await aiProvider.generate(request)
      applyResult(res)
      aiSucceed(res, label)
      setPipeline((prev) => prev.map((p) => (p.label === label ? { ...p, applied: true } : p)))
    } catch (err) {
      aiFail(err instanceof Error ? err.message : 'The AI service is temporarily unavailable.', label)
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable. Your data is safe.',
        variant: 'error',
      })
      throw err
    }
  }

  const applyResult = (res: Awaited<ReturnType<typeof aiProvider.generate>>) => {
    if (!res) return
    update((d: ResumeData) => {
      const next = { ...d }
      if (res.summary) {
        next.summary = res.summary
        next.summarySource = 'ai'
      }
      if (res.experience?.length) {
        next.experience = d.experience.map((e) => {
          const found = res.experience?.find((x) => x.company === e.company && x.jobTitle === e.jobTitle)
          if (!found) return e
          return {
            ...e,
            bullets: found.bullets?.length ? found.bullets : e.bullets,
            summary: found.summary ?? e.summary,
            technologies: found.technologies?.length ? [...new Set([...e.technologies, ...found.technologies])] : e.technologies,
          }
        })
      }
      if (res.projects?.length) {
        next.projects = d.projects.map((p) => {
          const found = res.projects?.find((x) => x.name === p.name)
          if (!found) return p
          return { ...p, description: found.description ?? p.description }
        })
      }
      if (res.keywords?.length) {
        setKeywords((prev) => [...new Set([...prev, ...(res.keywords ?? [])])])
      }
      return next
    })
  }

  const generateAll = async () => {
    if (!data || aiStatus === 'loading') return
    setCompleted(false)
    setPipeline([])
    setKeywords([])
    const steps: { label: string; request: Parameters<typeof aiProvider.generate>[0] }[] = []

    if (!data.summary.trim()) {
      steps.push({
        label: 'Optimizing your summary…',
        request: { resume: data, action: 'generate-summary' },
      })
    }
    const weakExp = data.experience.filter((e) => e.bullets.length === 0 || e.bullets.some((b) => /worked on|responsible for|helped/i.test(b)))
    if (weakExp.length > 0) {
      steps.push({
        label: 'Improving your bullet points…',
        request: { resume: data, action: 'improve-bullet' },
      })
    }
    const emptyProjects = data.projects.filter((p) => !p.description?.trim())
    if (emptyProjects.length > 0) {
      steps.push({
        label: 'Generating project descriptions…',
        request: { resume: data, action: 'generate-project-description' },
      })
    }
    steps.push({
      label: 'Matching keywords…',
      request: { resume: data, action: 'recommend-skills' },
    })

    if (steps.length === 0) {
      toast({ title: 'Your resume already looks strong', description: 'Review it and download when ready.', variant: 'info' })
      setCompleted(true)
      return
    }

    try {
      for (let i = 0; i < steps.length; i++) {
        setLoadingIdx(i)
        await runStep(steps[i].label, steps[i].request)
      }
      aiReset()
      setCompleted(true)
      toast({ title: 'Resume generated', description: 'Review the results below, then continue.', variant: 'success' })
    } catch {
      /* error already surfaced */
    }
  }

  const regenerateSummary = async () => {
    if (!data) return
    try {
      await runStep('Optimizing your summary…', { resume: data, action: 'generate-summary' })
      toast({ title: 'Summary updated', variant: 'success' })
    } catch {
      /* surfaced */
    }
  }

  const loadingLabel = pipeline.length > 0 ? pipeline[loadingIdx]?.label ?? AI_LOADING_STATES[0] : AI_LOADING_STATES[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">AI Generation</h2>
        <p className="mt-1 text-sm text-muted">
          AI rewrites content using only the information you provided. It never invents companies, metrics, or qualifications.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          {aiStatus === 'loading' ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {completed ? 'Your resume is ready to review' : aiStatus === 'loading' ? loadingLabel : 'Generate your resume with AI'}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {completed
            ? 'The suggestions below were applied. Continue to review and fine-tune every section.'
            : 'Creates your summary, strengthens weak bullet points, drafts project descriptions, and recommends keywords for your target role.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="accent" onClick={() => void generateAll()} loading={aiStatus === 'loading'}>
            {aiStatus === 'loading' ? 'Generating…' : 'Generate with AI'}
          </Button>
          {!data?.summary.trim() && (
            <Button type="button" variant="outline" onClick={() => void regenerateSummary()} disabled={aiStatus === 'loading'}>
              <Wand2 className="size-3.5" />
              Write summary
            </Button>
          )}
        </div>
      </div>

      {pipeline.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Applied changes</p>
          <ul className="space-y-2">
            {pipeline.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-sm">
                {p.applied ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Loader2 className="size-4 animate-spin text-accent" />
                )}
                <span className={p.applied ? 'text-foreground' : 'text-muted'}>{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5 animate-fade-in">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="size-4 text-accent" />
            Keywords to consider
          </p>
          <p className="mb-3 text-xs text-muted">
            Add these only where they reflect your real experience — never artificially.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <Badge key={k} variant="outline">{k}</Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Review Resume" />
    </div>
  )
}