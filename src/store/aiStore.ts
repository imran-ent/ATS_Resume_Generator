import { create } from 'zustand'
import type { AiGenerationResponse } from '@/types/resume'

type AiStatus = 'idle' | 'loading' | 'success' | 'error'

interface AiState {
  status: AiStatus
  label: string
  error: string | null
  result: AiGenerationResponse | null
  activeRequestId: string | null

  start: (label: string, requestId: string) => void
  succeed: (result: AiGenerationResponse, requestId: string) => void
  fail: (error: string, requestId: string) => void
  reset: () => void
  cancel: () => void
}

export const useAiStore = create<AiState>()((set, get) => ({
  status: 'idle',
  label: '',
  error: null,
  result: null,
  activeRequestId: null,

  start: (label, requestId) =>
    set({ status: 'loading', label, error: null, result: null, activeRequestId: requestId }),

  succeed: (result, requestId) => {
    if (get().activeRequestId !== requestId) return
    set({ status: 'success', result, activeRequestId: null })
  },

  fail: (error, requestId) => {
    if (get().activeRequestId !== requestId) return
    set({ status: 'error', error, activeRequestId: null })
  },

  reset: () => set({ status: 'idle', label: '', error: null, result: null, activeRequestId: null }),

  cancel: () => set({ status: 'idle', label: '', activeRequestId: null }),
}))