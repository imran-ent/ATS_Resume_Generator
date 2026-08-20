import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  Puzzle,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResumePreview } from '@/components/resume/resume-preview'
import { DEMO_RESUME } from '@/data/mock'
import { FEATURES, HOW_IT_WORKS, TRUST_INDICATORS } from '@/data/constants'

function HeroResumeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-3xl bg-accent/5 blur-2xl"
      />
      <div className="relative rounded-xl border border-border-strong bg-surface p-2 shadow-2xl">
        <div className="mb-2 flex items-center justify-between px-3 pt-1.5">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-subtle/40" />
            <span className="size-2 rounded-full bg-subtle/40" />
            <span className="size-2 rounded-full bg-subtle/40" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-subtle">
            Live Preview · A4
          </span>
        </div>
        <div className="overflow-hidden rounded-md">
          <ResumePreview data={DEMO_RESUME} />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute -right-3 top-8 hidden rounded-lg border border-border-strong bg-surface px-3 py-2 shadow-lg sm:block"
      >
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <FileCheck2 className="size-3.5 text-success" />
          ATS score
        </p>
        <p className="text-right font-serif text-lg font-semibold text-accent">92</p>
      </motion.div>
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="accent" className="mb-6">
                <Sparkles className="size-3" />
                AI-assisted · ATS-focused
              </Badge>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                Build a Resume That Gets Past the ATS.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Create an intelligently optimized, recruiter-ready resume
                tailored to the job you actually want.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/create">
                  <Button size="lg" variant="accent">
                    Create My Resume
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/analyze">
                  <Button size="lg" variant="outline">
                    Analyze My Resume
                  </Button>
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
                {TRUST_INDICATORS.map((t) => (
                  <li key={t.title} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="size-4 text-accent" />
                    {t.title}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          <HeroResumeCard />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="border-b border-border" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              How it works
            </p>
            <h2 id="how-it-works" className="text-3xl font-semibold tracking-tight text-foreground">
              From blank page to recruiter-ready in minutes.
            </h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS.map((s, i) => (
              <li
                key={s.step}
                className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong"
              >
                <span className="font-serif text-2xl font-semibold text-accent">{s.step}</span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <span className="mt-4 hidden text-subtle lg:block" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="border-b border-border" aria-labelledby="features">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Features
              </p>
              <h2 id="features" className="text-3xl font-semibold tracking-tight text-foreground">
                A premium tool, not a template site.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted">
              Everything is built around honest writing: AI rewrites only what
              you actually tell it about yourself.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = [Sparkles, ScanSearch, Puzzle, FileCheck2, FileText, ArrowRight, Sparkles, FileCheck2][i] ?? FileText
              return (
                <div
                  key={f.title}
                  className="group rounded-lg border border-border bg-surface p-6 transition-all hover:border-border-strong hover:bg-surface-2"
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-md border border-border-strong bg-surface-2 text-accent">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────── */}
      <section className="border-b border-border" aria-labelledby="templates">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Templates
            </p>
            <h2 id="templates" className="text-3xl font-semibold tracking-tight text-foreground">
              Refined designs. Zero ATS risk.
            </h2>
            <p className="mt-4 text-muted">
              No skill bars, no star ratings, no decorative graphics. Three
              professional layouts that ATS parsers read cleanly.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(['executive', 'modern', 'technical'] as const).map((id) => {
              const meta = {
                executive: { name: 'Executive', desc: 'Serif, traditional, elegant.' },
                modern: { name: 'Modern', desc: 'Clean hierarchy, contemporary.' },
                technical: { name: 'Technical', desc: 'Dense and keyword-forward.' },
              }[id]
              const data = { ...DEMO_RESUME, template: id }
              return (
                <div key={id} className="rounded-lg border border-border bg-surface p-3">
                  <div className="overflow-hidden rounded-md">
                    <ResumePreview data={data} />
                  </div>
                  <div className="px-2 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{meta.name}</h3>
                    <p className="mt-1 text-xs text-muted">{meta.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section aria-labelledby="cta">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border-strong bg-surface px-8 py-16 text-center">
            <h2 id="cta" className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your next role starts with a better resume.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Free to start. No fabricated experience — just professional writing
              grounded in your real background.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/create">
                <Button size="lg" variant="accent">
                  Create My Resume
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  View My Resumes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}