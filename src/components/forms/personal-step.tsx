import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, ImagePlus } from 'lucide-react'
import { personalSchema, type PersonalForm } from '@/lib/validation'
import { TextField, Field } from '@/components/forms/form-field'
import { StepFooter } from '@/components/forms/step-footer'
import { Input } from '@/components/ui/input'
import { useResumeDraft } from '@/hooks/useResumeDraft'

const MAX_PHOTO_BYTES = 2_500_000

export function PersonalStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { data, patch } = useResumeDraft()
  const fileRef = useRef<HTMLInputElement>(null)

  const form = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: data?.personal.fullName ?? '',
      professionalTitle: data?.personal.professionalTitle ?? '',
      photo: data?.personal.photo ?? '',
      contact: data?.personal.contact ?? {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      },
    },
  })

  const handlePhoto = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      form.setError('photo', { message: 'Image must be under 2.5 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      form.setValue('photo', String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const submit = form.handleSubmit((values) => {
    const contact = {
      email: values.contact.email ?? '',
      phone: values.contact.phone ?? '',
      location: values.contact.location ?? '',
      linkedin: values.contact.linkedin ?? '',
      github: values.contact.github ?? '',
      portfolio: values.contact.portfolio ?? '',
    }
    patch({ personal: { fullName: values.fullName, professionalTitle: values.professionalTitle, photo: values.photo ?? '', contact } })
    onNext()
  })

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Personal Information</h2>
        <p className="mt-1 text-sm text-muted">
          This becomes the header of your resume. Only add what you're comfortable sharing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full Name"
          placeholder="Jane Doe"
          required
          {...form.register('fullName')}
          error={form.formState.errors.fullName?.message}
        />
        <TextField
          label="Professional Title"
          placeholder="Senior Software Engineer"
          required
          {...form.register('professionalTitle')}
          error={form.formState.errors.professionalTitle?.message}
        />
        <TextField
          label="Email"
          type="email"
          placeholder="jane@example.com"
          {...form.register('contact.email')}
          error={form.formState.errors.contact?.email?.message}
        />
        <TextField
          label="Phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          optional
          {...form.register('contact.phone')}
        />
        <TextField
          label="Location"
          placeholder="San Francisco, CA"
          optional
          {...form.register('contact.location')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <TextField
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/janedoe"
          optional
          {...form.register('contact.linkedin')}
          error={form.formState.errors.contact?.linkedin?.message}
        />
        <TextField
          label="GitHub URL"
          placeholder="https://github.com/janedoe"
          optional
          {...form.register('contact.github')}
          error={form.formState.errors.contact?.github?.message}
        />
        <TextField
          label="Portfolio URL"
          placeholder="https://janedoe.dev"
          optional
          {...form.register('contact.portfolio')}
          error={form.formState.errors.contact?.portfolio?.message}
        />
      </div>

      <Field label="Profile photo" optional hint="Under 2.5 MB · optional">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-2">
            {form.watch('photo') ? (
              <img src={form.watch('photo')} alt="" className="size-full object-cover" />
            ) : (
              <Camera className="size-6 text-subtle" />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-sm text-muted hover:bg-surface-2"
            >
              <ImagePlus className="size-4" />
              Upload photo
            </button>
            {form.watch('photo') && (
              <button
                type="button"
                onClick={() => form.setValue('photo', '')}
                className="focus-ring rounded-md px-3 py-2 text-sm text-subtle hover:text-danger"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>
        <Input
          type="text"
          placeholder="…or paste an image URL"
          {...form.register('photo')}
          className="mt-3"
        />
        {form.formState.errors.photo?.message && (
          <p role="alert" className="text-xs text-danger">{form.formState.errors.photo.message}</p>
        )}
      </Field>

      <StepFooter onBack={onBack} onNext={() => void submit()} />
    </form>
  )
}