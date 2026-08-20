import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { useResumeDraft } from '@/hooks/useResumeDraft'
import { Repeatable } from '@/components/forms/repeatable'
import { TextField, TextAreaField, TagsInput } from '@/components/forms/form-field'
import { BulletsEditorWithAI } from '@/components/forms/bullets-editor-with-ai'
import { StepFooter } from '@/components/forms/step-footer'
import { Button } from '@/components/ui/button'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import type { ProjectItem, CertificationItem, AchievementItem } from '@/types/resume'
import { uid } from '@/lib/utils'

export function ProjectsStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const toast = useUiStore((s) => s.toast)
  const [genId, setGenId] = useState<string | null>(null)

  const projects = data?.projects ?? []
  const certifications = data?.certifications ?? []
  const achievements = data?.achievements ?? []

  const changeProject = (id: string, p: Partial<ProjectItem>) =>
    patch({ projects: projects.map((x) => (x.id === id ? { ...x, ...p } : x)) })
  const changeCert = (id: string, p: Partial<CertificationItem>) =>
    patch({ certifications: certifications.map((x) => (x.id === id ? { ...x, ...p } : x)) })
  const changeAch = (id: string, p: Partial<AchievementItem>) =>
    patch({ achievements: achievements.map((x) => (x.id === id ? { ...x, ...p } : x)) })

  const generateProjectDescription = async (project: ProjectItem) => {
    if (!data) return
    setGenId(project.id)
    try {
      const res = await aiProvider.generate({
        resume: { ...data, projects: [project] },
        action: 'generate-project-description',
      })
      const generated = res.projects?.[0]?.description
      if (generated) changeProject(project.id, { description: generated })
      toast({ title: 'Project description generated', variant: 'success' })
    } catch (err) {
      toast({
        title: 'Could not generate description',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable.',
        variant: 'error',
      })
    } finally {
      setGenId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Projects</h2>
        <p className="mt-1 text-sm text-muted">
          Personal or academic projects that demonstrate your skills. AI can draft concise, technical descriptions.
        </p>
      </div>

      <Repeatable
        items={projects}
        onAdd={() =>
          patch({
            projects: [
              ...projects,
              {
                id: uid('proj'),
                name: '',
                description: '',
                technologies: [],
                githubUrl: '',
                liveUrl: '',
                bullets: [],
              },
            ],
          })
        }
        onRemove={(id) => patch({ projects: projects.filter((x) => x.id !== id) })}
        onChange={(id, p) => changeProject(id, p)}
        addLabel="Add Project"
        emptyLabel="No projects yet. Add one or skip."
        render={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Project Name"
                placeholder="Invoice Tracker"
                value={item.name}
                onChange={(e) => changeProject(item.id, { name: e.target.value })}
              />
              <TextField
                label="GitHub URL"
                optional
                placeholder="https://github.com/you/project"
                value={item.githubUrl}
                onChange={(e) => changeProject(item.id, { githubUrl: e.target.value })}
              />
              <div className="sm:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <TextAreaField
                      label="Description"
                      optional
                      placeholder="What does it do? What problem does it solve?"
                      value={item.description}
                      onChange={(e) => changeProject(item.id, { description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void generateProjectDescription(item)}
                    disabled={genId === item.id}
                  >
                    {genId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                    {genId === item.id ? 'Generating…' : 'Generate with AI'}
                  </Button>
                </div>
              </div>
              <TextField
                label="Live Demo URL"
                optional
                placeholder="https://project.app"
                value={item.liveUrl}
                onChange={(e) => changeProject(item.id, { liveUrl: e.target.value })}
              />
              <div className="sm:col-span-2">
                <p className="mb-1.5 text-sm font-medium text-muted">Technologies</p>
                <TagsInput
                  value={item.technologies}
                  onChange={(v) => changeProject(item.id, { technologies: v })}
                  placeholder="e.g. React, Node.js, PostgreSQL…"
                  ariaLabel="Project technologies"
                />
              </div>
              <div className="sm:col-span-2">
                <BulletsEditorWithAI
                  value={item.bullets}
                  onChange={(v) => changeProject(item.id, { bullets: v })}
                  context={{
                    jobTitle: item.name,
                    company: 'Personal Project',
                    role: data?.targetJob.role,
                    technologies: item.technologies,
                  }}
                  jobDescription={data?.targetJob.jobDescription}
                  label="Key contributions"
                  placeholder="Your role in this project — decisions, tradeoffs, outcomes…"
                />
              </div>
            </div>
          </>
        )}
      />

      {/* Certifications — optional */}
      <section aria-labelledby="certs">
        <h3 id="certs" className="mb-3 text-base font-semibold text-foreground">Certifications (optional)</h3>
        <Repeatable
          items={certifications}
          onAdd={() =>
            patch({ certifications: [...certifications, { id: uid('cert'), name: '', organization: '', date: '', credentialUrl: '' }] })
          }
          onRemove={(id) => patch({ certifications: certifications.filter((x) => x.id !== id) })}
          onChange={(id, p) => changeCert(id, p)}
          addLabel="Add Certification"
          collapsible={false}
          render={(item) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Certification" value={item.name} onChange={(e) => changeCert(item.id, { name: e.target.value })} />
              <TextField label="Issuing Organization" value={item.organization} onChange={(e) => changeCert(item.id, { organization: e.target.value })} />
              <input
                type="month"
                value={item.date ?? ''}
                onChange={(e) => changeCert(item.id, { date: e.target.value })}
                className="focus-ring h-10 rounded-md border border-border-strong bg-surface-2 px-3 text-sm text-foreground"
                aria-label="Date"
              />
              <TextField label="Credential URL" optional value={item.credentialUrl} onChange={(e) => changeCert(item.id, { credentialUrl: e.target.value })} />
            </div>
          )}
        />
      </section>

      {/* Achievements — optional */}
      <section aria-labelledby="achievements">
        <h3 id="achievements" className="mb-3 text-base font-semibold text-foreground">Achievements (optional)</h3>
        <Repeatable
          items={achievements}
          onAdd={() => patch({ achievements: [...achievements, { id: uid('ach'), title: '', organization: '', date: '', description: '' }] })}
          onRemove={(id) => patch({ achievements: achievements.filter((x) => x.id !== id) })}
          onChange={(id, p) => changeAch(id, p)}
          addLabel="Add Achievement"
          collapsible={false}
          render={(item) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Achievement" value={item.title} onChange={(e) => changeAch(item.id, { title: e.target.value })} />
              <TextField label="Organization" optional value={item.organization} onChange={(e) => changeAch(item.id, { organization: e.target.value })} />
              <input
                type="month"
                value={item.date ?? ''}
                onChange={(e) => changeAch(item.id, { date: e.target.value })}
                className="focus-ring h-10 rounded-md border border-border-strong bg-surface-2 px-3 text-sm text-foreground"
                aria-label="Date"
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Description"
                  optional
                  value={item.description}
                  onChange={(e) => changeAch(item.id, { description: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      </section>

      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  )
}