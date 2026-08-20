import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  ScanSearch,
  FileText,
  PencilLine,
  LayoutTemplate,
} from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { useUiStore } from '@/store/uiStore'
import { exportResume } from '@/hooks/usePrintExport'
import { analyzeResume } from '@/services/ats/engine'
import { ResumePreview } from '@/components/resume/resume-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { AtsScoreCard, AtsCategories, AtsKeywords, AtsIssues, AtsStrengths, AtsTips } from '@/components/ats/ats-dashboard'
import {
  PersonalSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  AchievementsSection,
  TargetSection,
} from '@/components/editor/sections'
import { EmptyState } from '@/components/ui/empty-state'
import { TEMPLATES } from '@/data/constants'
import type { TemplateId } from '@/types/resume'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setCurrent = useResumeStore((s) => s.setCurrent)
  const setMeta = useResumeStore((s) => s.setMeta)
  const resume = useResumeStore((s) => (id ? s.resumes.find((r) => r.meta.id === id) : undefined))
  const toast = useUiStore((s) => s.toast)
  const [tab, setTab] = useState('edit')

  useEffect(() => {
    if (id) setCurrent(id)
  }, [id, setCurrent])

  const analysis = useMemo(() => {
    if (!resume) return null
    return analyzeResume(resume.data)
  }, [resume])

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Resume not found"
          description="This resume doesn't exist or was deleted."
          action={
            <Button variant="accent" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
          }
        />
      </div>
    )
  }

  const data = resume.data

  const handleExport = () => {
    if (!data.personal.fullName.trim()) {
      toast({ title: 'Add your name first', description: 'A resume needs at least a name before exporting.', variant: 'info' })
      return
    }
    exportResume(data)
  }

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="icon-sm" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
        <ArrowLeft className="size-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <Input
          value={resume.meta.title}
          onChange={(e) => setMeta(resume.meta.id, { title: e.target.value })}
          className="h-9 border-transparent bg-transparent px-2 font-semibold hover:border-border focus:bg-surface-2"
          aria-label="Resume title"
        />
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="size-4 text-subtle" />
          <Select
            value={data.template}
            onValueChange={(v) => useResumeStore.getState().updateData(resume.meta.id, (d) => ({ ...d, template: v as TemplateId }))}
            aria-label="Template"
            className="h-9 w-40"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/analyze?id=${resume.meta.id}`)}>
          <ScanSearch className="size-3.5" />
          Analyze
        </Button>
        <Button variant="accent" size="sm" onClick={handleExport}>
          <Download className="size-3.5" />
          Download PDF
        </Button>
      </div>
    </div>
  )

  const editorColumn = (
    <div className="space-y-4">
      <PersonalSection />
      <SummarySection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificationsSection />
      <AchievementsSection />
      <TargetSection />
    </div>
  )

  const previewColumn = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">Live preview</p>
        <span className="flex items-center gap-1.5 text-xs text-subtle">
          <FileText className="size-3.5" />
          A4 · {resume.meta.title}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface p-3">
        <ResumePreview data={data} />
      </div>
    </div>
  )

  const atsColumn = analysis ? (
    <div className="space-y-4">
      <AtsScoreCard analysis={analysis} />
      <AtsCategories analysis={analysis} />
      <AtsStrengths analysis={analysis} />
      <AtsKeywords analysis={analysis} />
      <AtsIssues analysis={analysis} />
      <AtsTips analysis={analysis} />
    </div>
  ) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {header}

      {/* Desktop split-screen */}
      <div className="mt-6 hidden gap-8 lg:grid lg:grid-cols-[1fr_1.15fr]">
        <div className="min-h-[600px]">{editorColumn}</div>
        <div className="min-h-[600px]">{previewColumn}</div>
      </div>

      {/* Mobile tabs */}
      <div className="mt-4 lg:hidden">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">
              <PencilLine className="size-4" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <FileText className="size-4" /> Preview
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex-1">
              <ScanSearch className="size-4" /> ATS
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit">{editorColumn}</TabsContent>
          <TabsContent value="preview">{previewColumn}</TabsContent>
          <TabsContent value="ats">{atsColumn}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}