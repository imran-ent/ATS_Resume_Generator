import { useState } from 'react'
import { Loader2, ScanSearch, Briefcase } from 'lucide-react'
import { useResumeDraft } from '@/hooks/useResumeDraft'
import { Field } from '@/components/forms/form-field'
import { StepFooter } from '@/components/forms/step-footer'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import { ROLE_SUGGESTIONS } from '@/data/constants'
import type { AiJobAnalysis } from '@/types/resume'

export function TargetJobStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const toast = useUiStore((s) => s.toast)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AiJobAnalysis | null>(null)

  const role = data?.targetJob.role ?? ''
  const jd = data?.targetJob.jobDescription ?? ''

  const setRole = (value: string) => patch({ targetJob: { role: value, jobDescription: jd } })
  const setJd = (value: string) => patch({ targetJob: { role, jobDescription: value } })

  const analyze = async () => {
    if (!jd.trim()) {
      toast({ title: 'Paste a job description first', variant: 'info' })
      return
    }
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const res = await aiProvider.analyzeJob(jd, role)
      setAnalysis(res)
      toast({ title: 'Job description analyzed', variant: 'success' })
    } catch (err) {
      toast({
        title: 'Could not analyze the job description',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable.',
        variant: 'error',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Target Job</h2>
        <p className="mt-1 text-sm text-muted">
          Everything downstream — keywords, ATS score, AI rewriting — is tuned to this role.
        </p>
      </div>

      <Field label="What job are you targeting?" htmlFor="target-role">
        <Input
          id="target-role"
          list="role-suggestions"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Java Backend Developer"
        />
        <datalist id="role-suggestions">
          {ROLE_SUGGESTIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </Field>

      <Field label="Paste the job description" htmlFor="target-jd" optional hint="Recommended for best keyword matching">
        <Textarea
          id="target-jd"
          rows={6}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
        />
      </Field>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2/50 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Analyze this job description</p>
          <p className="mt-0.5 text-xs text-muted">
            Extracts required skills, technologies, responsibilities, and seniority.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void analyze()} loading={analyzing} disabled={!jd.trim()}>
          <ScanSearch className="size-3.5" />
          Analyze
        </Button>
      </div>

      {analyzing && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin text-accent" />
          Extracting requirements…
        </div>
      )}

      {analysis && (
        <div className="space-y-4 rounded-lg border border-border bg-surface p-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Briefcase className="size-4 text-accent" />
              {analysis.estimatedRole}
            </p>
            <Badge variant="accent">{analysis.seniority}</Badge>
          </div>
          <AnalysisGroup title="Required skills" items={analysis.requiredSkills} variant="accent" />
          <AnalysisGroup title="Preferred skills" items={analysis.preferredSkills} variant="default" />
          <AnalysisGroup title="Technologies" items={analysis.technologies} variant="outline" />
          <AnalysisGroup title="Responsibilities" items={analysis.responsibilities} variant="default" list />
          {analysis.educationRequirements.length > 0 && (
            <AnalysisGroup title="Education requirements" items={analysis.educationRequirements} variant="default" />
          )}
        </div>
      )}

      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  )
}

function AnalysisGroup({
  title,
  items,
  variant,
  list = false,
}: {
  title: string
  items: string[]
  variant: 'accent' | 'default' | 'outline'
  list?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">{title}</p>
      {list ? (
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
          {items.slice(0, 8).map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 14).map((i) => (
            <Badge key={i} variant={variant}>{i}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}