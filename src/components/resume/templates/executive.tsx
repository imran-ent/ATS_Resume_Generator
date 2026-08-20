import type { ResumeData } from '@/types/resume'
import {
  AchievementEntry,
  CertEntry,
  ContactLine,
  EduEntry,
  JobEntry,
  ProjectEntry,
  SectionBody,
  SectionHeading,
  SkillsBlock,
} from '../resumeParts'

function Header({ data }: { data: ResumeData }) {
  const { personal } = data
  return (
    <header className="text-center">
      {data.settings.includePhoto && personal.photo && (
        <img
          src={personal.photo}
          alt=""
          className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
        />
      )}
      <h1 className="font-serif text-[24pt] font-semibold uppercase tracking-[0.08em] text-black">
        {personal.fullName || 'Your Name'}
      </h1>
      <p className="mt-1 font-serif text-[12pt] italic text-[#4a4a4f]">
        {personal.professionalTitle}
      </p>
      <div className="mx-auto mt-3 h-px w-24 bg-black" />
      <div className="mt-3">
        <ContactLine data={data} />
      </div>
    </header>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHeading variant="serif" style="underline">
        {title}
      </SectionHeading>
      <SectionBody>{children}</SectionBody>
    </section>
  )
}

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const hasCerts = data.certifications.length > 0
  const hasAwards = data.achievements.length > 0

  return (
    <div className="flex flex-col gap-6 px-14 py-12">
      <Header data={data} />
      {data.summary && (
        <Section title="Summary">
          <p className="leading-[1.5] text-black">{data.summary}</p>
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {data.experience.map((e) => (
              <JobEntry key={e.id} item={e} />
            ))}
          </div>
        </Section>
      )}
      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((e) => (
              <EduEntry key={e.id} item={e} />
            ))}
          </div>
        </Section>
      )}
      {data.skills.technical.some((g) => g.skills.length > 0) && (
        <Section title="Skills">
          <SkillsBlock groups={data.skills.technical} soft={data.skills.soft} />
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {data.projects.map((p) => (
              <ProjectEntry key={p.id} item={p} />
            ))}
          </div>
        </Section>
      )}
      {hasCerts && (
        <Section title="Certifications">
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <CertEntry key={c.id} item={c} />
            ))}
          </div>
        </Section>
      )}
      {hasAwards && (
        <Section title="Achievements">
          <div className="space-y-2">
            {data.achievements.map((a) => (
              <AchievementEntry key={a.id} item={a} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}