import type { ResumeData } from '@/types/resume'
import {
  AchievementEntry,
  CertEntry,
  ContactLine,
  EduEntry,
  JobEntry,
  SectionBody,
  SectionHeading,
  SkillsBlock,
  TechLine,
} from '../resumeParts'

function Header({ data }: { data: ResumeData }) {
  const { personal } = data
  const allTechs = [
    ...data.skills.technical.flatMap((g) => g.skills),
    ...data.experience.flatMap((e) => e.technologies),
  ]
  return (
    <header>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {data.settings.includePhoto && personal.photo && (
            <img
              src={personal.photo}
              alt=""
              className="h-16 w-16 rounded object-cover"
            />
          )}
          <div>
            <h1 className="text-[20pt] font-bold uppercase tracking-tight text-black">
              {personal.fullName || 'Your Name'}
            </h1>
            <p className="text-[10.5pt] font-semibold text-[#4a4a4f]">
              {personal.professionalTitle}
            </p>
          </div>
        </div>
        <div className="text-right text-[8.5pt] leading-relaxed">
          <ContactLine data={data} />
        </div>
      </div>
      {allTechs.length > 0 && (
        <p className="mt-2 border-t border-black/15 pt-2 text-[9pt] text-[#4a4a4f]">
          <span className="font-semibold text-black">Core: </span>
          {[...new Set(allTechs)].join(' · ')}
        </p>
      )}
    </header>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHeading style="rule">{title}</SectionHeading>
      <SectionBody>{children}</SectionBody>
    </section>
  )
}

export function TechnicalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="flex flex-col gap-4 px-11 py-10">
      <Header data={data} />
      {data.summary && (
        <Section title="Profile">
          <p className="text-black">{data.summary}</p>
        </Section>
      )}
      {data.skills.technical.some((g) => g.skills.length > 0) && (
        <Section title="Skills">
          <SkillsBlock groups={data.skills.technical} soft={data.skills.soft} />
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {data.experience.map((e) => (
              <div key={e.id}>
                <JobEntry item={e} dense />
              </div>
            ))}
          </div>
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-2.5">
            {data.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-black">{p.name}</p>
                  {p.technologies.length > 0 && <TechLine items={p.technologies.slice(0, 4)} />}
                </div>
                {p.description && <p className="text-black">{p.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2.5">
            {data.education.map((e) => (
              <EduEntry key={e.id} item={e} />
            ))}
          </div>
        </Section>
      )}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-1.5">
            {data.certifications.map((c) => (
              <CertEntry key={c.id} item={c} />
            ))}
          </div>
        </Section>
      )}
      {data.achievements.length > 0 && (
        <Section title="Achievements">
          <div className="space-y-1.5">
            {data.achievements.map((a) => (
              <AchievementEntry key={a.id} item={a} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}