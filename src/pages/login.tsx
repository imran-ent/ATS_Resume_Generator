import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, KeyRound, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AUTH_MODE_LABEL, AUTH_MODE } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function LoginPage() {
  const navigate = useNavigate()
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const error = useAuthStore((s) => s.error)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const demo = AUTH_MODE === 'demo'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await signInWithEmail(email, password)
    setLoading(false)
    if (ok) navigate('/dashboard')
  }

  const google = async () => {
    setLoading(true)
    const ok = await signInWithGoogle()
    setLoading(false)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border-strong bg-surface-2">
          <Lock className="size-5 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Access your resumes across sessions.</p>
      </div>

      {demo ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
          <Info className="size-4 shrink-0" />
          Demo mode: use <strong className="font-semibold">demo@resumeforge.ai</strong> / <strong className="font-semibold">demo</strong>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted">
          <Info className="size-4 shrink-0" />
          {AUTH_MODE_LABEL}. Resumes are stored locally and can still be created and exported.
        </div>
      )}

      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" variant="accent" className="w-full" loading={loading}>
          Sign in with email
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-subtle">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => void google()} disabled={!demo || loading}>
        <KeyRound className="size-4" />
        Continue with Google
      </Button>

      <div className="mt-8 flex justify-center">
        <Badge variant="outline">{demo ? 'Demo authentication' : 'Auth provider not connected'}</Badge>
      </div>
    </div>
  )
}