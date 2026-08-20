import { create } from 'zustand'
import type { AuthStatus, AuthUser } from '@/types/resume'
import { authService } from '@/services/auth'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  user: null,
  error: null,

  refresh: async () => {
    try {
      const user = await authService.getSession()
      set({ status: user ? 'authenticated' : 'unauthenticated', user })
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null })
    try {
      const user = await authService.signInWithEmail(email, password)
      set({ status: 'authenticated', user })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.'
      set({ status: 'unauthenticated', user: null, error: message })
      return false
    }
  },

  signInWithGoogle: async () => {
    set({ error: null })
    try {
      const user = await authService.signInWithGoogle()
      set({ status: 'authenticated', user })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.'
      set({ status: 'unauthenticated', user: null, error: message })
      return false
    }
  },

  signOut: async () => {
    await authService.signOut()
    set({ status: 'unauthenticated', user: null, error: null })
  },
}))