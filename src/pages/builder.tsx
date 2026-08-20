import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { WIZARD_STEPS, type WizardStepId } from '@/data/constants'
import { PersonalStep } from '@/components/forms/personal-step'
import { ExperienceStep } from '@/components/forms/experience-step'
import { EducationStep } from '@/components/forms/education-step'
import { SkillsStep } from '@/components/forms/skills-step'
import { ProjectsStep } from '@/components/forms/projects-step'
import { TargetJobStep } from '@/components/forms/target-job-step'
import { GenerateStep } from '@/components/forms/generate-step'
import { ReviewStep } from '@/components/forms/review-step'
import { cn } from '@/lib/utils'

function isPracticallyEmpty(id: string | null) {
  if (!id) return true
  const resume = useResumeStore.getState().getResume(id)
  if (!resume) return true
  const d = resume.data
  return (
    !d.personal.fullName.trim() &&
    !d.personal.professionalTitle.trim() &&
    !d.summary.trim() &&
    d.experience.length === 0 &&
    d.education.length === 0
  )
}

export function BuilderPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(0)

  useEffect(() => {
    const currentId = useResumeStore.getState().currentId
    if (!currentId || !isPracticallyEmpty(currentId)) {
      useResumeStore.getState().createResume()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stepId = WIZARD_STEPS[step].id as WizardStepId

  const back = () => setStep((s) => Math.max(0, s - 1))
  const next = () => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))

  const stepContent = useMemo(() => {
    switch (stepId) {
      case 'personal':
        return <PersonalStep onNext={next} onBack={back} />
      case 'experience':
        return <ExperienceStep onNext={next} onBack={back} />
      case 'education':
        return <EducationStep onNext={next} onBack={back} />
      case 'skills':
        return <SkillsStep onNext={next} onBack={back} />
      case 'projects':
        return <ProjectsStep onNext={next} onBack={back} />
      case 'target':
        return <TargetJobStep onNext={next} onBack={back} />
      case 'generate':
        return <GenerateStep onNext={next} onBack={back} />
      case 'review':
        return <ReviewStep onBack={back} />
      default:
        return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId])

  const progress = ((step + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your resume</h1>
            <p className="mt-1 text-sm text-muted">Step {step + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[step].label}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="focus-ring flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
            Exit
          </button>
        </div>

        {/* Stepper */}
        <nav className="mt-6" aria-label="Resume builder steps">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {WIZARD_STEPS.map((s, i) => {
              const active = i === step
              const visited = i < step
              return (
                <div key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      'group flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors',
                      active && 'bg-accent text-accent-foreground',
                      visited && 'cursor-pointer text-accent hover:bg-accent-soft',
                      !active && !visited && 'text-subtle',
                    )}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]',
                        active && 'border-accent-foreground/30',
                        visited && 'border-accent',
                        !active && !visited && 'border-border-strong',
                      )}
                    >
                      {visited ? <Check className="size-3" /> : s.index}
                    </span>
                    <span className="hidden truncate lg:inline">{s.label}</span>
                  </button>
                  {i < WIZARD_STEPS.length - 1 && (
                    <span className={cn('h-px flex-1', i < step ? 'bg-accent/50' : 'bg-border')} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </nav>
      </div>

      <div key={stepId} className="animate-fade-up rounded-xl border border-border bg-surface p-6 sm:p-8">
        {stepContent}
      </div>
    </div>
  )
}