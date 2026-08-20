import { useResumeDraft } from '@/hooks/useResumeDraft'
import { Repeatable } from '@/components/forms/repeatable'
import { BulletsEditorWithAI } from '@/components/forms/bullets-editor-with-ai'
import { TextField, MonthField, TextAreaField, TagsInput } from '@/components/forms/form-field'
import { Switch } from '@/components/ui/switch'
import { StepFooter } from '@/components/forms/step-footer'
import type { ExperienceItem } from '@/types/resume'
import { uid } from '@/lib/utils'

export function ExperienceStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const items = data?.experience ?? []

  const add = () => {
    patch({
      experience: [
        ...items,
        {
          id: uid('exp'),
          company: '',
          jobTitle: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          summary: '',
          bullets: [],
          technologies: [],
        },
      ],
    })
  }

  const remove = (id: string) => {
    patch({ experience: items.filter((e) => e.id !== id) })
  }

  const change = (id: string, itemPatch: Partial<ExperienceItem>) => {
    patch({
      experience: items.map((e) => (e.id === id ? { ...e, ...itemPatch } : e)),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Work Experience</h2>
        <p className="mt-1 text-sm text-muted">
          Add your roles, most recent first. AI rewrites use only what you provide — no invented metrics.
        </p>
      </div>

      <Repeatable
        items={items}
        onAdd={add}
        onRemove={remove}
        onChange={(id, p) => change(id, p)}
        addLabel="Add Experience"
        emptyLabel="No experience yet. Add your first role or skip for now."
        render={(item) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Job Title"
                placeholder="Frontend Engineer"
                value={item.jobTitle}
                onChange={(e) => change(item.id, { jobTitle: e.target.value })}
              />
              <TextField
                label="Company"
                placeholder="Acme Inc."
                value={item.company}
                onChange={(e) => change(item.id, { company: e.target.value })}
              />
              <TextField
                label="Location"
                placeholder="Remote · San Francisco, CA"
                optional
                value={item.location}
                onChange={(e) => change(item.id, { location: e.target.value })}
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Role Summary"
                  placeholder="One line about the scope of this role…"
                  optional
                  value={item.summary}
                  onChange={(e) => change(item.id, { summary: e.target.value })}
                />
              </div>
              <MonthField
                label="Start Date"
                value={item.startDate ?? ''}
                onChange={(e) => change(item.id, { startDate: e.target.value })}
              />
              <MonthField
                label="End Date"
                optional
                disabled={item.current}
                value={item.current ? '' : (item.endDate ?? '')}
                onChange={(e) => change(item.id, { endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={item.current}
                onCheckedChange={(checked) =>
                  change(item.id, { current: checked, endDate: checked ? '' : item.endDate })
                }
                label="Current position"
              />
              <span className="text-sm text-muted">I currently work here</span>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-muted">Technologies used</p>
              <TagsInput
                value={item.technologies}
                onChange={(v) => change(item.id, { technologies: v })}
                placeholder="e.g. React, TypeScript, Node.js…"
                ariaLabel="Technologies used"
              />
            </div>
            <BulletsEditorWithAI
              value={item.bullets}
              onChange={(v) => change(item.id, { bullets: v })}
              context={{
                jobTitle: item.jobTitle,
                company: item.company,
                role: data?.targetJob.role,
                technologies: item.technologies,
              }}
              jobDescription={data?.targetJob.jobDescription}
            />
          </>
        )}
      />

      <StepFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={items.length > 0 ? 'Continue' : 'Skip for now'}
      />
    </div>
  )
}