import { useResumeDraft } from '@/hooks/useResumeDraft'
import { Repeatable } from '@/components/forms/repeatable'
import { TextField, MonthField, TagsInput } from '@/components/forms/form-field'
import { StepFooter } from '@/components/forms/step-footer'
import type { EducationItem } from '@/types/resume'
import { uid } from '@/lib/utils'

export function EducationStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const items = data?.education ?? []

  const add = () => {
    patch({
      education: [
        ...items,
        {
          id: uid('edu'),
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          gpa: '',
          coursework: [],
        },
      ],
    })
  }

  const remove = (id: string) => patch({ education: items.filter((e) => e.id !== id) })
  const change = (id: string, p: Partial<EducationItem>) =>
    patch({ education: items.map((e) => (e.id === id ? { ...e, ...p } : e)) })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Education</h2>
        <p className="mt-1 text-sm text-muted">Degrees, certifications of study, and relevant coursework.</p>
      </div>

      <Repeatable
        items={items}
        onAdd={add}
        onRemove={remove}
        onChange={(id, p) => change(id, p)}
        addLabel="Add Education"
        emptyLabel="No education added yet. Add a degree or skip for now."
        render={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Institution"
                placeholder="University of California"
                value={item.institution}
                onChange={(e) => change(item.id, { institution: e.target.value })}
              />
              <TextField
                label="Degree"
                placeholder="B.S."
                value={item.degree}
                onChange={(e) => change(item.id, { degree: e.target.value })}
              />
              <TextField
                label="Field of Study"
                placeholder="Computer Science"
                optional
                value={item.fieldOfStudy}
                onChange={(e) => change(item.id, { fieldOfStudy: e.target.value })}
              />
              <TextField
                label="GPA"
                placeholder="3.7"
                optional
                value={item.gpa}
                onChange={(e) => change(item.id, { gpa: e.target.value })}
              />
              <MonthField
                label="Start Date"
                value={item.startDate ?? ''}
                onChange={(e) => change(item.id, { startDate: e.target.value })}
              />
              <MonthField
                label="Graduation Date"
                value={item.endDate ?? ''}
                onChange={(e) => change(item.id, { endDate: e.target.value })}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-muted">Relevant coursework</p>
              <TagsInput
                value={item.coursework}
                onChange={(v) => change(item.id, { coursework: v })}
                placeholder="e.g. Data Structures, Operating Systems…"
                ariaLabel="Relevant coursework"
              />
            </div>
          </>
        )}
      />

      <StepFooter onBack={onBack} onNext={onNext} nextLabel={items.length > 0 ? 'Continue' : 'Skip for now'} />
    </div>
  )
}