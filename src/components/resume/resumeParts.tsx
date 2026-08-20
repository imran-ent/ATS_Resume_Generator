import type { ReactNode } from 'react'
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  SkillGroup,
} from '@/types/resume'
import { formatMonthYear } from '@/lib/utils'

export type HeadingVariant = 'serif' | 'sans' | 'mono'
export type HeadingStyle = 'rule' | 'accent-rule' | 'spaced' | 'underline'

interface HeadingProps {
  children: ReactNode
  variant?: HeadingVariant
  style?: HeadingStyle
}

export function SectionHeading({ children, variant = 'sans', style = 'rule' }: HeadingProps) {
  const base = 'flex items-center gap-3'
  const font = {
    serif: "font-serif text-[13pt] tracking-wide text-black",
    sans: 'text-[11.5pt] font-semibold uppercase tracking-[0.14em] text-black',
    mono: "font-mono text-[11pt] font-semibold uppercase tracking-[0.12em] text-black",
  }
  return (
    <h2 className={`${base} ${font[variant]} mb-2.5`}>
      <span className="shrink-0">{children}</span>
      {style === 'rule' && <span className="h-px flex-1 bg-black/20" />}
      {style === 'accent-rule' && <span className="h-[2px] flex-1 bg-black/25" />}
      {style === 'underline' && <span className="h-[2px] w-10 bg-black" />}
      {style === 'spaced' && <span className="h-px flex-1 bg-transparent" />}
    </h2>
  )
}

export function SectionBody({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

export function JobEntry({
  item,
  dense = false,
}: {
  item: ExperienceItem
  dense?: boolean
}) {
  const dates = formatMonthYear(item.startDate) && (
    <span className="shrink-0 whitespace-nowrap font-medium text-[#4a4a4f]">
      {formatMonthYear(item.startDate)} – {item.current ? 'Present' : formatMonthYear(item.endDate)}
    </span>
  )
  return (
    <div className={dense ? '' : 'space-y-1.5'}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-black">{item.jobTitle}</p>
          <p className="text-[#4a4a4f]">{item.company}</p>
        </div>
        <div className="text-right text-[9pt]">{dates}</div>
      </div>
      {item.summary && <p className="text-black">{item.summary}</p>}
      {item.bullets.length > 0 && <BulletList items={item.bullets} />}
      {item.technologies.length > 0 && (
        <TechLine items={item.technologies} />
      )}
    </div>
  )
}

export function EduEntry({ item }: { item: EducationItem }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-black">{item.institution}</p>
          <p className="text-[#4a4a4f]">
            {item.degree}
            {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}
          </p>
        </div>
        <div className="shrink-0 whitespace-nowrap text-[9pt] text-[#4a4a4f]">
          {formatMonthYear(item.startDate) && (
            <>
              {formatMonthYear(item.startDate)} – {formatMonthYear(item.endDate) || 'Present'}
            </>
          )}
        </div>
      </div>
      {item.gpa && <p className="text-[#4a4a4f]">GPA: {item.gpa}</p>}
      {item.coursework.length > 0 && (
        <p className="text-[#4a4a4f]">
          <span className="font-medium text-black">Coursework: </span>
          {item.coursework.join(', ')}
        </p>
      )}
    </div>
  )
}

export function ProjectEntry({ item }: { item: ProjectItem }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-black">{item.name}</p>
        </div>
        <div className="shrink-0 text-right text-[9pt] text-[#4a4a4f]">
          {item.liveUrl && <span className="mr-2">{cleanHost(item.liveUrl)}</span>}
          {item.githubUrl && <span>{cleanHost(item.githubUrl)}</span>}
        </div>
      </div>
      {item.description && <p className="text-black">{item.description}</p>}
      {item.bullets.length > 0 && <BulletList items={item.bullets} />}
      {item.technologies.length > 0 && <TechLine items={item.technologies} />}
    </div>
  )
}

export function CertEntry({ item }: { item: CertificationItem }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-black">{item.name}</p>
        {item.organization && <p className="text-[#4a4a4f]">{item.organization}</p>}
      </div>
      {item.date && (
        <span className="shrink-0 whitespace-nowrap text-[9pt] text-[#4a4a4f]">
          {formatMonthYear(item.date)}
        </span>
      )}
    </div>
  )
}

export function AchievementEntry({ item }: { item: { title: string; organization?: string; date?: string | null; description?: string } }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 font-semibold text-black">{item.title}</p>
        {item.date && (
          <span className="shrink-0 whitespace-nowrap text-[9pt] text-[#4a4a4f]">
            {formatMonthYear(item.date)}
          </span>
        )}
      </div>
      {item.organization && <p className="text-[#4a4a4f]">{item.organization}</p>}
      {item.description && <p className="text-black">{item.description}</p>}
    </div>
  )
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0.5">
      {items.filter(Boolean).map((b, i) => (
        <li key={i} className="flex gap-2 text-black">
          <span className="shrink-0 leading-[1.45]">•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

export function TechLine({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <p className="text-[#4a4a4f]">
      <span className="font-medium text-black">Technologies: </span>
      {items.join(', ')}
    </p>
  )
}

export function SkillsBlock({
  groups,
  soft,
  mode = 'inline',
}: {
  groups: SkillGroup[]
  soft?: string[]
  mode?: 'inline' | 'columns'
}) {
  const present = groups.filter((g) => g.skills.length > 0)
  if (present.length === 0 && (!soft || soft.length === 0)) return null

  if (mode === 'columns') {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {present.map((g) => (
          <div key={g.label}>
            <span className="font-semibold text-black">{g.label}: </span>
            <span className="text-black">{g.skills.join(', ')}</span>
          </div>
        ))}
        {soft && soft.length > 0 && (
          <div>
            <span className="font-semibold text-black">Soft Skills: </span>
            <span className="text-black">{soft.join(', ')}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {present.map((g) => (
        <p key={g.label}>
          <span className="font-semibold text-black">{g.label}: </span>
          <span className="text-black">{g.skills.join(', ')}</span>
        </p>
      ))}
      {soft && soft.length > 0 && (
        <p>
          <span className="font-semibold text-black">Soft Skills: </span>
          <span className="text-black">{soft.join(', ')}</span>
        </p>
      )}
    </div>
  )
}

export function ContactLine({ data }: { data: ResumeData }) {
  const c = data.personal.contact
  const parts: string[] = [
    c.email,
    c.phone,
    c.location,
    c.linkedin && cleanHost(c.linkedin),
    c.github && cleanHost(c.github),
    c.portfolio && cleanHost(c.portfolio),
  ].filter(Boolean) as string[]
  if (parts.length === 0) return null
  return <p className="text-black">{parts.join('  |  ')}</p>
}

export function cleanHost(url: string) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '')
  }
}

export function PaperContent({ children }: { children: ReactNode }) {
  return <article className="resume-paper flex flex-col gap-5 px-14 py-12">{children}</article>
}