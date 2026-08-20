import type { AiGenerationResponse, AiJobAnalysis } from '@/types/resume'
import type { AIProvider } from './types'

const COMMON_TECHS = [
  'react', 'typescript', 'javascript', 'node.js', 'node', 'java', 'spring boot', 'spring',
  'python', 'django', 'flask', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql',
  'rest', 'api', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ci/cd',
  'git', 'jenkins', 'kafka', 'rabbitmq', 'pandas', 'numpy', 'scikit-learn', 'tensorflow',
  'pytorch', 'tableau', 'power bi', 'excel', 'html', 'css', 'tailwind', 'next.js', 'vue',
  'angular', 'flutter', 'react native', 'swift', 'kotlin', 'jest', 'selenium', 'cypress',
]

const TECH_DISPLAY: Record<string, string> = {
  react: 'React',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  'node.js': 'Node.js',
  node: 'Node.js',
  java: 'Java',
  'spring boot': 'Spring Boot',
  spring: 'Spring',
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  sql: 'SQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  graphql: 'GraphQL',
  rest: 'REST API',
  api: 'API',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  terraform: 'Terraform',
  'ci/cd': 'CI/CD',
  git: 'Git',
  jenkins: 'Jenkins',
  kafka: 'Kafka',
  rabbitmq: 'RabbitMQ',
  pandas: 'Pandas',
  numpy: 'NumPy',
  'scikit-learn': 'scikit-learn',
  tensorflow: 'TensorFlow',
  pytorch: 'PyTorch',
  tableau: 'Tableau',
  'power bi': 'Power BI',
  excel: 'Excel',
  html: 'HTML',
  css: 'CSS',
  tailwind: 'Tailwind CSS',
  'next.js': 'Next.js',
  vue: 'Vue',
  angular: 'Angular',
  flutter: 'Flutter',
  'react native': 'React Native',
  swift: 'Swift',
  kotlin: 'Kotlin',
  jest: 'Jest',
  selenium: 'Selenium',
  cypress: 'Cypress',
}

const displayTech = (t: string) => TECH_DISPLAY[t] ?? t.charAt(0).toUpperCase() + t.slice(1)

const SENIORITY_HINTS: Array<[RegExp, string]> = [
  [/senior|staff|lead/i, 'Senior'],
  [/junior|associate|entry/i, 'Junior'],
  [/principal|architect/i, 'Principal'],
  [/manager|head of/i, 'Management'],
]

function extractTechTerms(text: string) {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const t of COMMON_TECHS) {
    if (new RegExp(`(^|[^a-z0-9+#.])${t.replace(/[.+#]/g, '\\$&')}([^a-z0-9+#.]|$)`, 'i').test(lower)) {
      found.add(t)
    }
  }
  return [...found]
}

function strongBullets(techs: string[], summary: string) {
  const t = techs.length > 0 ? techs.slice(0, 3).join(', ') : 'modern web technologies'
  return [
    `Developed and maintained ${t} features, improving usability across desktop and mobile.`,
    summary
      ? `Collaborated with cross-functional teams to deliver ${summary.trim().toLowerCase().replace(/\.$/, '')} on schedule.`
      : 'Collaborated with cross-functional teams to plan, build, and ship features on schedule.',
    'Wrote clean, maintainable code following established conventions and participated in code reviews.',
  ]
}

const improveWeakBullet = (bullet: string, techs: string[]) => {
  const lower = bullet.toLowerCase()
  const t = techs.length > 0 ? techs.slice(0, 3).join(', ') : 'modern web technologies'

  if (/worked on|responsible for|helped with|did|made/i.test(lower)) {
    return `Developed responsive features using ${t}, improving usability across desktop and mobile devices.`
  }
  if (/learning|learned/i.test(lower)) {
    return `Applied ${t} in production work, strengthening practical delivery skills.`
  }
  if (/fix(ed|ing)? bugs?|bug fixes/i.test(lower)) {
    return 'Identified and resolved defects in existing code, improving reliability and reducing regression reports.'
  }
  if (/meetings?|attended/i.test(lower)) {
    return 'Contributed to sprint planning and technical discussions, aligning delivery with business goals.'
  }
  if (/test/i.test(lower)) {
    return 'Wrote and maintained automated tests, improving coverage and reducing manual regression effort.'
  }

  const cleaned = bullet.replace(/^\s*[-•·]\s*/, '').replace(/\.+$/, '').trim()
  if (cleaned.length > 0) {
    return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}, using ${t} where applicable.`
  }
  return `Delivered production code using ${t} within an agile team environment.`
}

export class MockAIProvider implements AIProvider {
  readonly name = 'mock'

  async generate(request: {
    resume: Parameters<AIProvider['generate']>[0]['resume']
    action: Parameters<AIProvider['generate']>[0]['action']
    target?: string
    jobDescription?: string
  }): Promise<AiGenerationResponse> {
    const { resume, action, target, jobDescription } = request
    await this.delay()

    const experienceTechs = resume.experience.flatMap((e) => e.technologies)
    const projectTechs = resume.projects.flatMap((p) => p.technologies)
    const allTechs = [...new Set([...experienceTechs, ...projectTechs])]
    const role = resume.targetJob.role || target || 'Software Engineer'

    switch (action) {
      case 'generate-summary':
      case 'improve-summary': {
        const years = resume.experience.length > 0 ? resume.experience.length : 0
        const techClause =
          allTechs.length > 0
            ? `skilled in ${allTechs.slice(0, 4).join(', ')}`
            : 'with a track record of delivering clean, maintainable work'
        const expClause =
          resume.experience.length > 0
            ? `Bringing ${years} ${years === 1 ? 'role' : 'roles'} of hands-on experience building production software`
            : 'A dedicated builder focused on delivering production-quality software'
        const title = resume.personal.professionalTitle || role
        const base = `${title} with a focus on ${resume.targetJob.role || role.toLowerCase()} work. ${expClause}, ${techClause}.`
        const jdClause = jobDescription
          ? ' Aligned with the requirements outlined in the target job description, emphasizing the most relevant strengths.'
          : ' Known for clear communication, strong problem-solving, and a pragmatic approach to delivery.'
        return { summary: base + jdClause }
      }

      case 'improve-bullet':
        return this.improveResume(resume, allTechs)

      case 'generate-project-description': {
        const first = resume.projects[0]
        if (!first) return { projects: [] }
        const techs = first.technologies.length > 0 ? first.technologies.join(', ') : 'modern tooling'
        return {
          projects: [
            {
              id: first.id,
              name: first.name,
              description: `Designed and built ${first.name}, a production-focused application using ${techs}. Implemented core features end to end, emphasizing performance, maintainability, and a clean user experience.`,
              technologies: first.technologies,
              githubUrl: first.githubUrl,
              liveUrl: first.liveUrl,
              bullets: first.bullets,
            },
          ],
        }
      }

      case 'recommend-skills': {
        const pool = this.skillPool(role)
        const grouped = this.groupPool(pool)
        return {
          skills: grouped,
          keywords: pool,
          suggestions: [
            `Recommended skills for a ${role} role. Add only the ones you genuinely use.`,
          ],
        }
      }

      default:
        return this.improveResume(resume, allTechs)
    }
  }

  async improveBullet(request: {
    bullet: string
    context: { jobTitle: string; company: string; role?: string; technologies?: string[] }
    jobDescription?: string
  }): Promise<{ improved: string }> {
    await this.delay()
    const techs = request.context.technologies ?? []
    return { improved: improveWeakBullet(request.bullet, techs) }
  }

  async rewrite(request: {
    text: string
    action: 'improve' | 'shorten' | 'make-technical' | 'make-professional' | 'add-keywords' | 'fix-grammar'
    role?: string
    context?: string
  }): Promise<{ result: string }> {
    await this.delay()
    const text = request.text.trim()
    const role = request.role || 'Software Engineer'

    switch (request.action) {
      case 'shorten': {
        const sentences = text
          .replace(/\s+/g, ' ')
          .split(/(?<=\.)\s+/)
          .filter(Boolean)
        const first = sentences[0] ?? text
        return { result: `${first.endsWith('.') ? first : `${first}.`}` }
      }
      case 'fix-grammar':
        return { result: text.replace(/\s{2,}/g, ' ').replace(/\.+/g, '.').replace(/\s*,\s*/g, ', ') }
      case 'make-professional': {
        const noFiller = text
          .replace(/\b(just|basically|really|very|a lot of|kind of|sort of)\b/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim()
        const capitalized = noFiller.charAt(0).toUpperCase() + noFiller.slice(1)
        return { result: `${capitalized.replace(/\.$/, '')}.` }
      }
      case 'make-technical': {
        const techs = request.context ? extractTechTerms(request.context) : []
        const clause =
          techs.length > 0
            ? ` (implemented with ${techs.slice(0, 3).join(', ')})`
            : ''
        return { result: `${text.replace(/\.$/, '')}, following engineering best practices${clause}.` }
      }
      case 'add-keywords': {
        const pool = this.skillPool(role).slice(0, 4)
        return { result: `${text.replace(/\.$/, '')}. Relevant strengths: ${pool.join(', ')}.` }
      }
      case 'improve':
      default: {
        const techs = request.context ? extractTechTerms(request.context) : []
        const clause = techs.length > 0 ? ` using ${techs.slice(0, 3).join(', ')}` : ''
        const cleaned = text.replace(/^[-•·]\s*/, '')
        return { result: `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}${clause}.` }
      }
    }
  }

  async analyzeJob(jobDescription: string, role?: string): Promise<AiJobAnalysis> {
    await this.delay()
    const techs = extractTechTerms(jobDescription)
    const generic = ['communication', 'collaboration', 'problem solving', 'agile']
    const seniority = SENIORITY_HINTS.find(([re]) => re.test(jobDescription))?.[1] ?? 'Mid-level'
    const responsibilities = this.extractResponsibilities(jobDescription)

    return {
      requiredSkills: techs.slice(0, 6).map(displayTech),
      preferredSkills: techs.slice(6, 12).map(displayTech),
      technologies: techs.map(displayTech),
      responsibilities,
      keywords: [...new Set([...techs, ...generic])].map(displayTech),
      seniority,
      educationRequirements: jobDescription.toLowerCase().includes('bachelor')
        ? ["Bachelor's degree in a relevant field"]
        : [],
      estimatedRole: role || 'Software Engineer',
      timestamp: new Date().toISOString(),
    }
  }

  private improveResume(
    resume: Parameters<AIProvider['generate']>[0]['resume'],
    allTechs: string[],
  ): AiGenerationResponse {
    const experience = resume.experience.map((e) => {
      const techs = e.technologies.length > 0 ? e.technologies : allTechs.slice(0, 3)
      const bullets = e.bullets.length > 0 ? e.bullets : strongBullets(techs, e.summary)
      return {
        ...e,
        bullets: bullets.map((b) => improveWeakBullet(b, techs)),
        technologies: techs,
      }
    })
    const projects = resume.projects.map((p) => ({
      ...p,
      description:
        p.description ||
        `Designed and built ${p.name}${p.technologies.length > 0 ? ` using ${p.technologies.join(', ')}` : ''}, shipping core features end to end.`,
      bullets: p.bullets.length > 0 ? p.bullets : [],
    }))
    const role = resume.targetJob.role || 'Software Engineer'
    const pool = this.skillPool(role)
    return {
      experience,
      projects,
      keywords: pool.slice(0, 10),
      suggestions: [
        'Add a short professional summary if you have not written one yet.',
        `Include the suggested ${role} keywords only where they reflect your real experience.`,
        'Ensure every date uses the same format (e.g., "Jan 2023").',
      ],
    }
  }

  private skillPool(role: string): string[] {
    const map: Record<string, string[]> = {
      'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Responsive Design', 'Accessibility'],
      'Java Backend Developer': ['Java', 'Spring Boot', 'Hibernate', 'REST API', 'SQL', 'JUnit', 'Maven', 'Microservices'],
      'Backend Developer': ['Node.js', 'Express', 'REST API', 'SQL', 'NoSQL', 'Message Queues'],
      'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'REST API', 'SQL', 'Docker'],
      'Data Analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Tableau', 'Statistics'],
      'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Statistics'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
      'Machine Learning Engineer': ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Feature Engineering'],
      'Mobile Developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'REST API'],
    }
    const key = Object.keys(map).find((k) => role.toLowerCase().includes(k.toLowerCase()))
    return key ? map[key] : ['SQL', 'REST API', 'Git', 'Testing', 'CI/CD', 'Agile']
  }

  private groupPool(pool: string[]) {
    const groups: { label: string; skills: string[] }[] = [
      { label: 'Programming Languages & Frameworks', skills: pool.slice(0, 4) },
      { label: 'Tools & Platforms', skills: pool.slice(4, 8) },
    ]
    return { technical: groups, soft: ['Communication', 'Collaboration', 'Problem Solving'] }
  }

  private extractResponsibilities(text: string) {
    const lines = text
      .split(/\n|•|;|\.\s+/)
      .map((l) => l.trim().replace(/^[-*]\s*/, ''))
      .filter((l) => l.length > 8 && /[a-z]/.test(l))
    return lines.slice(0, 8)
  }

  private delay() {
    return new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 700))
  }
}