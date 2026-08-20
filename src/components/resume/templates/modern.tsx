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
    <header className="flex items-start justify-between gap-6">
      <div className="flex items-center gap-4">
        {data.settings.includePhoto && personal.photo && (
          <img
            src={personal.photo}
            alt=""
            className="h-20 w-20 rounded-md object-cover"
          />
        )}
        <div>
          <h1 className="text-[22pt] font-bold leading-tight tracking-tight text-black">
            {personal.fullName || 'Your Name'}
          </h1>
          <p className="text-[11pt] font-medium text-[#4a4a4f]">
            {personal.professionalTitle}
          </p>
        </div>
      </div>
      <div className="text-right text-[9pt] leading-relaxed">
        <ContactLine data={data} />
      </div>
    </header>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHeading style="accent-rule">{title}</SectionHeading>
      <SectionBody>{children}</SectionBody>
    </section>
  )
}

export function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="flex flex-col gap-5 px-12 py-11">
      <Header data={data} />
      <div className="h-px bg-black/25" />
      {data.summary && (
        <Section title="Summary">
          <p className="text-black">{data.summary}</p>
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3.5">
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
          <SkillsBlock
            groups={data.skills.technical}
            soft={data.skills.soft}
            mode="columns"
          />
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
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-2">
            {data.certifications.map((c) => (
              <CertEntry key={c.id} item={c} />
            ))}
          </div>
        </Section>
      )}
      {data.achievements.length > 0 && (
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