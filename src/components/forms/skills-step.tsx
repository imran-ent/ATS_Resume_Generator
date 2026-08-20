import { useState } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useResumeDraft } from '@/hooks/useResumeDraft'
import { TagsInput } from '@/components/forms/form-field'
import { StepFooter } from '@/components/forms/step-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import { SKILL_CATEGORIES } from '@/data/constants'
import type { SkillGroup } from '@/types/resume'

export function SkillsStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const toast = useUiStore((s) => s.toast)
  const [suggesting, setSuggesting] = useState(false)
  const [suggested, setSuggested] = useState<string[]>([])
  const [added, setAdded] = useState<string[]>([])

  const groups = data?.skills.technical ?? []
  const soft = data?.skills.soft ?? []

  const setGroups = (next: SkillGroup[]) => patch({ skills: { ...(data?.skills ?? { technical: [], soft: [] }), technical: next } })
  const setSoft = (next: string[]) => patch({ skills: { ...(data?.skills ?? { technical: [], soft: [] }), soft: next } })

  const updateGroup = (label: string, skills: string[]) => {
    setGroups(groups.map((g) => (g.label === label ? { ...g, skills } : g)))
  }

  const addGroup = (label: string) => {
    if (groups.some((g) => g.label === label)) return
    setGroups([...groups, { label, skills: [] }])
  }

  const removeGroup = (label: string) => setGroups(groups.filter((g) => g.label !== label))

  const recommend = async () => {
    if (!data) return
    setSuggesting(true)
    try {
      const res = await aiProvider.generate({
        resume: data,
        action: 'recommend-skills',
        target: data.targetJob.role,
        jobDescription: data.targetJob.jobDescription,
      })
      const list = [...new Set([...(res.skills?.technical.flatMap((g) => g.skills) ?? []), ...(res.skills?.soft ?? [])])]
      const existing = new Set([
        ...groups.flatMap((g) => g.skills),
        ...soft,
      ].map((s) => s.toLowerCase()))
      setSuggested(list.filter((s) => !existing.has(s.toLowerCase())))
      setAdded([])
      toast({ title: 'Skills recommended for your target role', variant: 'success' })
    } catch (err) {
      toast({
        title: 'Could not recommend skills',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable.',
        variant: 'error',
      })
    } finally {
      setSuggesting(false)
    }
  }

  const addSuggested = (skill: string) => {
    const existing = new Set([...groups.flatMap((g) => g.skills), ...soft].map((s) => s.toLowerCase()))
    if (existing.has(skill.toLowerCase()) || added.includes(skill)) return
    setAdded([...added, skill])
    const first = groups.find((g) => g.label === 'Frameworks & Libraries') ?? groups[0]
    if (first) {
      setGroups(groups.map((g) => (g.label === first.label ? { ...g, skills: [...g.skills, skill] } : g)))
    } else {
      setGroups([...groups, { label: 'Other', skills: [skill] }])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Skills</h2>
        <p className="mt-1 text-sm text-muted">
          Group your skills so ATS parsers can map them. AI suggestions are clearly separate from what you already have.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Recommend skills for your target role</p>
            <p className="mt-0.5 text-xs text-muted">
              Suggestions are only added when you confirm — we never claim skills you haven't provided.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void recommend()} loading={suggesting}>
            <Sparkles className="size-3.5" />
            {data?.targetJob.role ? `Recommend for ${data.targetJob.role}` : 'Recommend'}
          </Button>
        </div>
        {suggested.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
              Suggested for this role (add only what you genuinely know)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((s) => {
                const done = added.includes(s) || groups.flatMap((g) => g.skills).some((x) => x.toLowerCase() === s.toLowerCase())
                return (
                  <Badge key={s} variant={done ? 'success' : 'outline'} className="cursor-default">
                    {s}
                    {!done && (
                      <button
                        type="button"
                        aria-label={`Add ${s}`}
                        onClick={() => addSuggested(s)}
                        className="ml-0.5 rounded p-0.5 hover:text-accent"
                      >
                        <Plus className="size-3" />
                      </button>
                    )}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label} className="rounded-lg border border-border bg-surface-2/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{g.label}</p>
              <button
                type="button"
                onClick={() => removeGroup(g.label)}
                className="focus-ring rounded p-1 text-subtle hover:text-danger"
                aria-label={`Remove ${g.label} group`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <TagsInput
              value={g.skills}
              onChange={(v) => updateGroup(g.label, v)}
              placeholder="e.g. TypeScript, React, PostgreSQL…"
              ariaLabel={`Skills in ${g.label}`}
            />
          </div>
        ))}

        <div>
          <p className="mb-1.5 text-sm font-medium text-muted">Add a skills category</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                disabled={groups.some((g) => g.label === c)}
                onClick={() => addGroup(c)}
                className="focus-ring rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
              >
                {groups.some((g) => g.label === c) ? 'Added' : `+ ${c}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 p-4">
        <p className="mb-1.5 text-sm font-medium text-muted">Soft skills (optional)</p>
        <TagsInput
          value={soft}
          onChange={setSoft}
          placeholder="e.g. Communication, Leadership, Problem Solving…"
          ariaLabel="Soft skills"
        />
      </div>

      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  )
}