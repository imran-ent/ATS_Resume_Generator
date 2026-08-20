import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, TrendingUp, XCircle } from 'lucide-react'
import type { AtsAnalysis, AtsStatus } from '@/types/resume'
import { atsStatus } from '@/services/ats/engine'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const STATUS_META: Record<AtsStatus, { label: string; className: string }> = {
  excellent: { label: 'Excellent', className: 'text-success' },
  good: { label: 'Good', className: 'text-warning' },
  'needs-work': { label: 'Needs work', className: 'text-danger' },
}

const CATEGORY_LABELS: { key: keyof AtsAnalysis['categories']; label: string }[] = [
  { key: 'keywordMatch', label: 'Keyword Match' },
  { key: 'skillsMatch', label: 'Skills Match' },
  { key: 'formatting', label: 'Formatting' },
  { key: 'experienceRelevance', label: 'Experience Relevance' },
  { key: 'completeness', label: 'Completeness' },
]

export function AtsScoreCard({ analysis }: { analysis: AtsAnalysis }) {
  const [display, setDisplay] = useState(0)
  const status = atsStatus(analysis.overall)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const duration = 900
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(analysis.overall * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [analysis.overall])

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">ATS Score</p>
          <p className="mt-1 text-sm text-muted">Estimated ATS Compatibility Score</p>
        </div>
        <Badge variant={status === 'excellent' ? 'success' : status === 'good' ? 'warning' : 'danger'}>
          {STATUS_META[status].label}
        </Badge>
      </div>
      <div className="mt-6 flex items-end gap-3">
        <span className="font-serif text-6xl font-semibold leading-none tracking-tight text-foreground">
          {display}
        </span>
        <span className="pb-1 text-xl font-medium text-subtle">/ 100</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${display}%`,
            background:
              display >= 80 ? 'var(--color-success)' : display >= 60 ? 'var(--color-warning)' : 'var(--color-danger)',
          }}
        />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{analysis.summary}</p>
      <Separator className="my-5" />
      <p className="text-xs leading-relaxed text-subtle">
        This is an estimated score computed from formatting, completeness, and keyword signals. It does not guarantee
        how any specific ATS will score your resume.
      </p>
    </div>
  )
}

export function AtsCategories({ analysis }: { analysis: AtsAnalysis }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-5 text-sm font-semibold text-foreground">Category breakdown</h3>
      <div className="space-y-4">
        {CATEGORY_LABELS.map(({ key, label }) => {
          const value = analysis.categories[key]
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className="font-medium text-foreground">{value}%</span>
              </div>
              <Progress value={value} label={label} indicatorClassName={value >= 70 ? 'bg-success' : value >= 50 ? 'bg-warning' : 'bg-danger'} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AtsKeywords({ analysis }: { analysis: AtsAnalysis }) {
  const missing = analysis.missingKeywords
  const matched = analysis.matchedKeywords
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="size-4 text-success" />
          Matched keywords
        </h3>
        {matched.length === 0 ? (
          <p className="text-sm text-muted">No keywords matched yet. Add relevant keywords from the job description.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {matched.map((k) => (
              <Badge key={k.keyword} variant="success">{k.keyword}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <XCircle className="size-4 text-warning" />
          Missing keywords
        </h3>
        {missing.length === 0 ? (
          <p className="text-sm text-muted">All target keywords are covered. Nice work.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((k) => (
                <Badge key={k.keyword} variant="outline">{k.keyword}</Badge>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-subtle">
              Consider adding these if you genuinely have the skill — never add skills you do not possess.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export function AtsIssues({ analysis }: { analysis: AtsAnalysis }) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }
  if (analysis.issues.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-6 text-success" />
        <p className="text-sm text-muted">No issues detected.</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Suggestions & issues</h3>
      <ul className="space-y-3">
        {analysis.issues.map((issue, i) => {
          const Icon = icons[issue.severity]
          return (
            <li key={i} className="flex gap-3">
              <Icon className={cn('mt-0.5 size-4 shrink-0', issue.severity === 'error' ? 'text-danger' : issue.severity === 'warning' ? 'text-warning' : 'text-accent')} />
              <div>
                <p className="text-sm font-medium text-foreground">{issue.message}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{issue.suggestion}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function AtsStrengths({ analysis }: { analysis: AtsAnalysis }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <TrendingUp className="size-4 text-accent" />
        What's working
      </h3>
      <ul className="space-y-2">
        {analysis.strengths.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-accent" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AtsTips({ analysis }: { analysis: AtsAnalysis }) {
  if (analysis.suggestions.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Lightbulb className="size-4 text-warning" />
        Recommended next steps
      </h3>
      <ol className="space-y-2">
        {analysis.suggestions.slice(0, 5).map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-muted">
            <span className="font-serif font-semibold text-accent">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}