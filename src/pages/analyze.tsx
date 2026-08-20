import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ClipboardPaste, FileText, PencilLine, ScanSearch } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { analyzeResume, analyzeText } from '@/services/ats/engine'
import { AtsScoreCard, AtsCategories, AtsKeywords, AtsIssues, AtsStrengths, AtsTips } from '@/components/ats/ats-dashboard'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { ROLE_SUGGESTIONS } from '@/data/constants'

export function AnalyzePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const resumes = useResumeStore((s) => s.resumes)

  const idParam = params.get('id')
  const resume = idParam ? resumes.find((r) => r.meta.id === idParam) : undefined

  const [mode, setMode] = useState<'text' | 'resume'>('text')
  const [selectedId, setSelectedId] = useState<string>(resumes[0]?.meta.id ?? '')
  const [pasted, setPasted] = useState('')
  const [role, setRole] = useState('Software Engineer')

  const selectedResume = resumes.find((r) => r.meta.id === selectedId)

  const textAnalysis = useMemo(() => {
    if (mode !== 'text' || pasted.trim().length < 40) return null
    return analyzeText(pasted, role)
  }, [mode, pasted, role])

  const resumeAnalysis = useMemo(() => {
    if (selectedResume && mode === 'resume') return analyzeResume(selectedResume.data)
    return null
  }, [selectedResume, mode])

  // If arriving via ?id= from the editor
  if (resume) {
    const analysis = analyzeResume(resume.data)
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">ATS Analysis</h1>
              <p className="text-sm text-muted">{resume.meta.title}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/editor/${resume.meta.id}`)}>
            <PencilLine className="size-3.5" />
            Edit resume
          </Button>
        </div>
        <div className="space-y-4">
          <AtsScoreCard analysis={analysis} />
          <AtsCategories analysis={analysis} />
          <AtsStrengths analysis={analysis} />
          <AtsKeywords analysis={analysis} />
          <AtsIssues analysis={analysis} />
          <AtsTips analysis={analysis} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">ATS Analyzer</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Get an estimated ATS compatibility score with transparent, actionable feedback. Scores are estimates —
          no tool can guarantee how a specific ATS will score your resume.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={mode === 'text' ? 'flex items-center gap-2 rounded-md bg-surface-2 px-4 py-2 text-sm font-medium text-foreground' : 'flex items-center gap-2 rounded-md px-4 py-2 text-sm text-muted hover:bg-surface-2'}
        >
          <ClipboardPaste className="size-4" />
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode('resume')}
          disabled={resumes.length === 0}
          className={mode === 'resume' ? 'flex items-center gap-2 rounded-md bg-surface-2 px-4 py-2 text-sm font-medium text-foreground' : 'flex items-center gap-2 rounded-md px-4 py-2 text-sm text-muted hover:bg-surface-2 disabled:opacity-40'}
        >
          <FileText className="size-4" />
          Analyze saved resume
        </button>
      </div>

      {mode === 'text' ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="analyze-role">Target role</Label>
              <Input id="analyze-role" list="analyze-roles" value={role} onChange={(e) => setRole(e.target.value)} />
              <datalist id="analyze-roles">
                {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="analyze-paste">Paste your resume text</Label>
            <Textarea
              id="analyze-paste"
              rows={12}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Copy the text from your existing resume and paste it here…"
            />
            <p className="text-xs text-subtle">
              {pasted.trim().length < 40 ? 'Paste at least a few sentences to get a meaningful analysis.' : 'Analysis updates live as you type.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.length === 0 ? (
            <EmptyState
              title="No saved resumes"
              description="Create a resume first, then analyze it here."
              action={<Button variant="accent" onClick={() => navigate('/create')}>Create Resume</Button>}
            />
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="analyze-select">Choose a resume</Label>
              <Select id="analyze-select" value={selectedId} onValueChange={setSelectedId}>
                {resumes.map((r) => (
                  <option key={r.meta.id} value={r.meta.id}>{r.meta.title}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      {(textAnalysis || resumeAnalysis) && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <AtsScoreCard analysis={textAnalysis ?? resumeAnalysis!} />
          <AtsCategories analysis={textAnalysis ?? resumeAnalysis!} />
          <AtsStrengths analysis={textAnalysis ?? resumeAnalysis!} />
          <AtsKeywords analysis={textAnalysis ?? resumeAnalysis!} />
          <AtsIssues analysis={textAnalysis ?? resumeAnalysis!} />
          <AtsTips analysis={textAnalysis ?? resumeAnalysis!} />
        </div>
      )}

      {mode === 'text' && pasted.trim().length < 40 && (
        <div className="mt-8 rounded-xl border border-dashed border-border-strong p-10 text-center">
          <ScanSearch className="mx-auto mb-3 size-6 text-subtle" />
          <p className="text-sm text-muted">Your estimated ATS score will appear here.</p>
        </div>
      )}
    </div>
  )
}