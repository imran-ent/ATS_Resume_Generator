import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { APP_NAME } from '@/data/constants'

const FOOTER_LINKS = [
  { to: '/create', label: 'Create Resume' },
  { to: '/dashboard', label: 'My Resumes' },
  { to: '/analyze', label: 'ATS Analyzer' },
  { to: '/login', label: 'Sign In' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md border border-border-strong bg-surface-2">
                <FileText className="size-3.5 text-accent" />
              </span>
              <span className="text-sm font-semibold text-foreground">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted">
              AI-assisted resume builder focused on ATS compatibility, honest
              writing, and recruiter-ready output.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-subtle">
            ATS scores shown here are estimated compatibility scores computed from
            formatting, completeness, and keyword signals. They do not guarantee
            how any specific applicant tracking system will score your resume.
            {APP_NAME} never fabricates experience, metrics, or qualifications —
            all content is grounded in the information you provide.
          </p>
        </div>
      </div>
    </footer>
  )
}