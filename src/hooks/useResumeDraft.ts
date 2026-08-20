import { useResumeStore } from '@/store/resumeStore'
import type { ResumeData } from '@/types/resume'

/** Binds a component to the current draft resume data with typed updates. */
export function useResumeDraft() {
  const currentId = useResumeStore((s) => s.currentId)
  const data = useResumeStore((s) =>
    currentId ? s.resumes.find((r) => r.meta.id === currentId)?.data : undefined,
  )
  const updateData = useResumeStore((s) => s.updateData)

  const patch = (patch: Partial<ResumeData>) => {
    if (currentId) updateData(currentId, (d) => ({ ...d, ...patch }))
  }

  return {
    currentId,
    data,
    patch,
    update: (fn: (d: ResumeData) => ResumeData) => {
      if (currentId) updateData(currentId, fn)
    },
  }
}