import { create } from 'zustand'
import type { ResumeData } from '@/types/resume'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: 'default' | 'success' | 'error' | 'info'
}

interface UiState {
  mobileNavOpen: boolean
  printActive: boolean
  printPayload: ResumeData | null
  toasts: ToastItem[]
  setMobileNavOpen: (open: boolean) => void
  setPrintActive: (active: boolean) => void
  requestPrint: (data: ResumeData) => void
  toast: (t: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
}

let toastId = 0

export const useUiStore = create<UiState>()((set) => ({
  mobileNavOpen: false,
  printActive: false,
  printPayload: null,
  toasts: [],

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setPrintActive: (active) => set({ printActive: active }),

  requestPrint: (data) => set({ printPayload: data, printActive: true }),

  toast: (t) => {
    const id = `toast_${++toastId}`
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 5000)
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))