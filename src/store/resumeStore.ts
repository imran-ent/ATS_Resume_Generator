import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Resume, ResumeData, ResumeMeta } from '@/types/resume'
import { emptyResumeData } from '@/data/mock'
import { uid } from '@/lib/utils'

interface ResumeStore {
  resumes: Resume[]
  currentId: string | null

  createResume: (title?: string) => string
  getResume: (id: string) => Resume | undefined
  getCurrent: () => Resume | undefined
  setCurrent: (id: string | null) => void
  updateData: (id: string, updater: (data: ResumeData) => ResumeData) => void
  patchData: (id: string, patch: Partial<ResumeData>) => void
  setMeta: (id: string, patch: Partial<ResumeMeta>) => void
  duplicate: (id: string) => string
  remove: (id: string) => void
  reset: () => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: [],
      currentId: null,

      createResume: (title) => {
        const id = uid('resume')
        const now = new Date().toISOString()
        const resume: Resume = {
          meta: {
            id,
            title: title ?? 'Untitled Resume',
            createdAt: now,
            updatedAt: now,
            atsScore: null,
            lastAtsCheck: null,
          },
          data: emptyResumeData(),
        }
        set((s) => ({ resumes: [...s.resumes, resume], currentId: id }))
        return id
      },

      getResume: (id) => get().resumes.find((r) => r.meta.id === id),

      getCurrent: () => {
        const { currentId, resumes } = get()
        return resumes.find((r) => r.meta.id === currentId)
      },

      setCurrent: (id) => set({ currentId: id }),

      updateData: (id, updater) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.meta.id === id
              ? {
                  meta: { ...r.meta, updatedAt: new Date().toISOString() },
                  data: updater(r.data),
                }
              : r,
          ),
        })),

      patchData: (id, patch) =>
        get().updateData(id, (data) => ({ ...data, ...patch })),

      setMeta: (id, patch) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.meta.id === id ? { ...r, meta: { ...r.meta, ...patch } } : r,
          ),
        })),

      duplicate: (id) => {
        const src = get().getResume(id)
        if (!src) return ''
        const newId = uid('resume')
        const now = new Date().toISOString()
        const copy: Resume = {
          meta: {
            ...src.meta,
            id: newId,
            title: `${src.meta.title} (Copy)`,
            createdAt: now,
            updatedAt: now,
            atsScore: null,
            lastAtsCheck: null,
          },
          data: JSON.parse(JSON.stringify(src.data)) as ResumeData,
        }
        set((s) => ({ resumes: [...s.resumes, copy], currentId: newId }))
        return newId
      },

      remove: (id) =>
        set((s) => ({
          resumes: s.resumes.filter((r) => r.meta.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
        })),

      reset: () => set({ resumes: [], currentId: null }),
    }),
    {
      name: 'resumeforge.resumes.v1',
      partialize: (s) => ({ resumes: s.resumes, currentId: s.currentId }),
    },
  ),
)

export function selectResumeById(state: ResumeStore, id: string) {
  return state.resumes.find((r) => r.meta.id === id)
}