import type { AuthUser } from '@/types/resume'

/**
 * Authentication is abstracted behind a service so a real backend / auth
 * provider can be connected later without touching UI code.
 *
 * - Default mode: backend not connected — sign-in returns a clear error.
 * - Demo mode (`VITE_AUTH_MODE=demo`): a clearly-labeled demo session.
 */
export interface AuthService {
  getSession(): Promise<AuthUser | null>
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  signInWithGoogle(): Promise<AuthUser>
  signOut(): Promise<void>
}

class UnconfiguredAuthService implements AuthService {
  async getSession() {
    return null
  }
  async signInWithEmail(_email: string, _password: string): Promise<AuthUser> {
    throw new Error(
      'Authentication is not connected yet. Connect your backend auth provider to enable sign-in.',
    )
  }
  async signInWithGoogle(): Promise<AuthUser> {
    throw new Error(
      'Google sign-in is not connected yet. Configure an OAuth provider on the backend to enable it.',
    )
  }
  async signOut() {}
}

class DemoAuthService implements AuthService {
  async getSession() {
    try {
      const raw = localStorage.getItem('resumeforge.auth.session')
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  }
  async signInWithEmail(email: string, password: string) {
    if (email !== 'demo@resumeforge.ai' || password !== 'demo') {
      throw new Error('Demo credentials: demo@resumeforge.ai / demo')
    }
    const user: AuthUser = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@resumeforge.ai',
      provider: 'email',
    }
    localStorage.setItem('resumeforge.auth.session', JSON.stringify(user))
    return user
  }
  async signInWithGoogle() {
    const user: AuthUser = {
      id: 'demo-google',
      name: 'Demo User',
      email: 'demo@resumeforge.ai',
      provider: 'google',
    }
    localStorage.setItem('resumeforge.auth.session', JSON.stringify(user))
    return user
  }
  async signOut() {
    localStorage.removeItem('resumeforge.auth.session')
  }
}

export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE ?? 'none').toLowerCase()

export const authService: AuthService =
  AUTH_MODE === 'demo' ? new DemoAuthService() : new UnconfiguredAuthService()

export const AUTH_MODE_LABEL =
  AUTH_MODE === 'demo'
    ? 'Demo authentication enabled — use demo@resumeforge.ai / demo'
    : 'Backend authentication not connected'