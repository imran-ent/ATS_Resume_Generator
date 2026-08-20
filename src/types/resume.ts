/* ─── Resume domain types ────────────────────────────────────────────── */

export type MonthYear = string | null

export interface ContactInfo {
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
}

export interface PersonalInfo {
  fullName: string
  professionalTitle: string
  photo: string
  contact: ContactInfo
}

export interface ExperienceItem {
  id: string
  company: string
  jobTitle: string
  location: string
  startDate: MonthYear
  endDate: MonthYear
  current: boolean
  summary: string
  bullets: string[]
  technologies: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: MonthYear
  endDate: MonthYear
  gpa: string
  coursework: string[]
}

export interface SkillGroup {
  label: string
  skills: string[]
}

export interface SkillsData {
  technical: SkillGroup[]
  soft: string[]
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  technologies: string[]
  githubUrl: string
  liveUrl: string
  bullets: string[]
}

export interface CertificationItem {
  id: string
  name: string
  organization: string
  date: MonthYear
  credentialUrl: string
}

export interface AchievementItem {
  id: string
  title: string
  organization: string
  date: MonthYear
  description: string
}

export type TemplateId = 'executive' | 'modern' | 'technical'

export interface TargetJob {
  role: string
  jobDescription: string
}

export interface ResumeData {
  personal: PersonalInfo
  summary: string
  summarySource: 'manual' | 'ai' | 'empty'
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillsData
  projects: ProjectItem[]
  certifications: CertificationItem[]
  achievements: AchievementItem[]
  targetJob: TargetJob
  template: TemplateId
  settings: {
    fontSize: 'small' | 'medium' | 'large'
    includePhoto: boolean
  }
}

export interface ResumeMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  atsScore: number | null
  lastAtsCheck: string | null
}

export interface Resume {
  meta: ResumeMeta
  data: ResumeData
}

/* ─── ATS ────────────────────────────────────────────────────────────── */

export interface AtsCategoryScores {
  keywordMatch: number
  skillsMatch: number
  formatting: number
  experienceRelevance: number
  completeness: number
}

export interface KeywordResult {
  keyword: string
  matched: boolean
  source: 'required' | 'preferred' | 'general'
}

export interface AtsIssue {
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
}

export interface AtsAnalysis {
  overall: number
  categories: AtsCategoryScores
  matchedKeywords: KeywordResult[]
  missingKeywords: KeywordResult[]
  matchedSkills: string[]
  suggestedSkills: string[]
  issues: AtsIssue[]
  strengths: string[]
  suggestions: string[]
  summary: string
  timestamp: string
}

export type AtsStatus = 'excellent' | 'good' | 'needs-work'

/* ─── AI ─────────────────────────────────────────────────────────────── */

export type AiAction =
  | 'generate-summary'
  | 'improve-bullet'
  | 'improve-summary'
  | 'shorten'
  | 'make-technical'
  | 'make-professional'
  | 'add-keywords'
  | 'fix-grammar'
  | 'generate-project-description'
  | 'recommend-skills'

export type AiRewriteAction =
  | 'improve'
  | 'shorten'
  | 'make-technical'
  | 'make-professional'
  | 'add-keywords'
  | 'fix-grammar'

export interface AiRewriteRequest {
  text: string
  action: AiRewriteAction
  role?: string
  context?: string
}

export interface AiGenerationRequest {
  resume: ResumeData
  action: AiAction
  target?: string
  context?: string
  jobDescription?: string
}

export interface AiGenerationResponse {
  summary?: string
  experience?: ExperienceItem[]
  education?: EducationItem[]
  skills?: SkillsData
  projects?: ProjectItem[]
  certifications?: CertificationItem[]
  achievements?: AchievementItem[]
  keywords?: string[]
  suggestions?: string[]
}

export interface AiImproveBulletRequest {
  bullet: string
  context: {
    jobTitle: string
    company: string
    role?: string
    technologies?: string[]
  }
  jobDescription?: string
}

export interface AiJobAnalysis {
  requiredSkills: string[]
  preferredSkills: string[]
  technologies: string[]
  responsibilities: string[]
  keywords: string[]
  seniority: string
  educationRequirements: string[]
  estimatedRole: string
  timestamp: string
}

/* ─── Auth ───────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  provider: 'email' | 'google'
}

export type AuthStatus = 'unauthenticated' | 'authenticated' | 'loading'