import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Copy,
  Download,
  FilePlus2,
  FileText,
  MoreHorizontal,
  PencilLine,
  ScanSearch,
  Trash2,
} from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { useUiStore } from '@/store/uiStore'
import { exportResume } from '@/hooks/usePrintExport'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { relativeTime } from '@/lib/utils'
import { atsStatus } from '@/services/ats/engine'
import type { Resume } from '@/types/resume'

function ResumeCard({ resume }: { resume: Resume }) {
  const navigate = useNavigate()
  const toast = useUiStore((s) => s.toast)
  const duplicate = useResumeStore((s) => s.duplicate)
  const remove = useResumeStore((s) => s.remove)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const score = resume.meta.atsScore
  const status = score !== null ? atsStatus(score) : null

  const handleDuplicate = () => {
    const newId = duplicate(resume.meta.id)
    toast({ title: 'Resume duplicated', variant: 'success' })
    navigate(`/editor/${newId}`)
  }

  const handleDownload = () => {
    if (!resume.data.personal.fullName.trim()) {
      toast({ title: 'Add your name first', description: 'A resume needs at least a name before exporting.', variant: 'info' })
      return
    }
    exportResume(resume.data)
  }

  return (
    <div className="group rounded-xl border border-border bg-surface transition-all hover:border-border-strong hover:shadow-lg">
      <button
        type="button"
        onClick={() => navigate(`/editor/${resume.meta.id}`)}
        className="focus-ring block w-full border-b border-border px-5 pb-4 pt-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{resume.meta.title}</h3>
            <p className="mt-1 text-xs text-muted">
              Last edited {relativeTime(resume.meta.updatedAt)}
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-subtle">
            <FileText className="size-5" />
          </span>
        </div>
      </button>

      <div className="flex items-center justify-between px-5 py-3.5">
        {score !== null ? (
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-semibold text-foreground">{score}</span>
            <span className="text-xs text-muted">ATS</span>
            <Badge variant={status === 'excellent' ? 'success' : status === 'good' ? 'warning' : 'danger'}>
              {status === 'excellent' ? 'Ready' : status === 'good' ? 'Good' : 'Needs work'}
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-subtle">No ATS score yet</span>
        )}

        <div className="relative">
          <button
            type="button"
            aria-label={`Actions for ${resume.meta.title}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="focus-ring rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div role="menu" className="absolute bottom-full right-0 z-30 mb-1 w-52 rounded-lg border border-border-strong bg-surface p-1.5 shadow-xl">
                <MenuItem icon={<PencilLine className="size-4" />} label="Edit" onClick={() => { setMenuOpen(false); navigate(`/editor/${resume.meta.id}`) }} />
                <MenuItem icon={<ScanSearch className="size-4" />} label="Analyze" onClick={() => { setMenuOpen(false); navigate(`/analyze?id=${resume.meta.id}`) }} />
                <MenuItem icon={<Copy className="size-4" />} label="Duplicate" onClick={() => { setMenuOpen(false); handleDuplicate() }} />
                <MenuItem icon={<Download className="size-4" />} label="Download PDF" onClick={() => { setMenuOpen(false); handleDownload() }} />
                <MenuItem icon={<Trash2 className="size-4 text-danger" />} label="Delete" danger onClick={() => { setMenuOpen(false); setConfirmDelete(true) }} />
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogHeader
          title="Delete this resume?"
          description="This permanently removes the resume and its ATS score. This cannot be undone."
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              remove(resume.meta.id)
              setConfirmDelete(false)
              toast({ title: 'Resume deleted', variant: 'info' })
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${danger ? 'text-danger hover:bg-danger/10' : 'text-foreground hover:bg-surface-2'}`}
    >
      {icon}
      {label}
    </button>
  )
}

export function DashboardPage() {
  const resumes = useResumeStore((s) => s.resumes)
  const createResume = useResumeStore((s) => s.createResume)
  const navigate = useNavigate()

  const create = () => {
    createResume()
    navigate(`/create`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Resumes</h1>
          <p className="mt-1 text-sm text-muted">
            {resumes.length > 0
              ? `${resumes.length} ${resumes.length === 1 ? 'resume' : 'resumes'} saved locally in your browser.`
              : 'Create your first AI-powered resume and start applying with confidence.'}
          </p>
        </div>
        <Button variant="accent" onClick={create}>
          <FilePlus2 className="size-4" />
          Create Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          title="No resumes yet"
          description="Create your first AI-powered resume and start applying with confidence."
          action={
            <div className="flex gap-3">
              <Button variant="accent" onClick={create}>
                <FilePlus2 className="size-4" />
                Create Resume
              </Button>
              <Link to="/analyze">
                <Button variant="outline">
                  <ScanSearch className="size-4" />
                  Analyze a Resume
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <ResumeCard key={r.meta.id} resume={r} />
          ))}
        </div>
      )}
    </div>
  )
}