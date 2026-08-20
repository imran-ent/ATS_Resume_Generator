import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FileText, LayoutDashboard, LogOut, Menu, ScanSearch, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { APP_NAME } from '@/data/constants'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} home`}>
      <span className="flex size-8 items-center justify-center rounded-md border border-border-strong bg-surface-2">
        <FileText className="size-4 text-accent" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </span>
    </Link>
  )
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'My Resumes', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze', icon: ScanSearch },
]

export function Navbar() {
  const mobileOpen = useUiStore((s) => s.mobileNavOpen)
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setMobileOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-surface-2 text-foreground' : 'text-muted hover:text-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-muted">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          )}
          <Link to="/create" className="hidden md:block">
            <Button size="sm" variant="accent">
              Create Resume
            </Button>
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="focus-ring rounded-md p-2 text-muted hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="space-y-1 px-4 py-4" aria-label="Mobile">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
            <Link
              to="/create"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center rounded-md bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground"
            >
              Create Resume
            </Link>
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}