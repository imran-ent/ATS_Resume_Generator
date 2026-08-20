import { z } from 'zod'

const monthYear = z.string().nullable().optional().or(z.literal(''))

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), { message: 'Enter a valid http(s) URL' })

/* ─── Personal ───────────────────────────────────────────────────────── */

export const contactSchema = z.object({
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  linkedin: urlOrEmpty.optional(),
  github: urlOrEmpty.optional(),
  portfolio: urlOrEmpty.optional(),
})

export const personalSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  professionalTitle: z.string().trim().min(1, 'Professional title is required'),
  photo: z.string().optional(),
  contact: contactSchema,
})

export type PersonalForm = z.infer<typeof personalSchema>

/* ─── Experience ─────────────────────────────────────────────────────── */

export const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Company is required'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  location: z.string().trim().optional(),
  startDate: monthYear,
  endDate: monthYear,
  current: z.boolean().default(false),
  summary: z.string().trim().optional(),
  bullets: z.array(z.string().trim()).default([]),
  technologies: z.array(z.string().trim()).default([]),
})

/* ─── Education ──────────────────────────────────────────────────────── */

export const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required'),
  degree: z.string().trim().min(1, 'Degree is required'),
  fieldOfStudy: z.string().trim().optional(),
  startDate: monthYear,
  endDate: monthYear,
  gpa: z.string().trim().optional(),
  coursework: z.array(z.string().trim()).default([]),
})

/* ─── Skills ─────────────────────────────────────────────────────────── */

export const skillGroupSchema = z.object({
  label: z.string().trim(),
  skills: z.array(z.string().trim()).default([]),
})

export const skillsSchema = z.object({
  technical: z.array(skillGroupSchema).default([]),
  soft: z.array(z.string().trim()).default([]),
})

/* ─── Projects / certs / achievements ────────────────────────────────── */

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional(),
  technologies: z.array(z.string().trim()).default([]),
  githubUrl: urlOrEmpty.optional(),
  liveUrl: urlOrEmpty.optional(),
  bullets: z.array(z.string().trim()).default([]),
})

export const certificationSchema = z.object({
  name: z.string().trim().min(1, 'Certification is required'),
  organization: z.string().trim().optional(),
  date: monthYear,
  credentialUrl: urlOrEmpty.optional(),
})

export const achievementSchema = z.object({
  title: z.string().trim().min(1, 'Achievement is required'),
  organization: z.string().trim().optional(),
  date: monthYear,
  description: z.string().trim().optional(),
})

/* ─── Target job ─────────────────────────────────────────────────────── */

export const targetJobSchema = z.object({
  role: z.string().trim().min(1, 'Select or enter a target role'),
  jobDescription: z.string().trim().optional(),
})

/* ─── AI structured responses ────────────────────────────────────────── */

const aiExperienceItem = z.object({
  company: z.string(),
  jobTitle: z.string(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().optional(),
  summary: z.string().nullable().optional(),
  bullets: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
})

const aiSkills = z.object({
  technical: z.array(skillGroupSchema).optional(),
  soft: z.array(z.string()).optional(),
})

const aiProjectItem = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  technologies: z.array(z.string()).optional(),
  githubUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  bullets: z.array(z.string()).optional(),
})

export const aiGenerationSchema = z.object({
  summary: z.string().optional(),
  experience: z.array(aiExperienceItem).optional(),
  education: z.array(educationSchema).optional(),
  skills: aiSkills.optional(),
  projects: z.array(aiProjectItem).optional(),
  certifications: z.array(certificationSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  keywords: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
})

export const aiJobAnalysisSchema = z.object({
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  technologies: z.array(z.string()),
  responsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  seniority: z.string(),
  educationRequirements: z.array(z.string()),
  estimatedRole: z.string(),
})

export const aiBulletResponseSchema = z.object({
  improved: z.string(),
})

export const aiSummaryResponseSchema = z.object({
  summary: z.string(),
})

/* ─── ATS analysis (client-side, validated shape) ────────────────────── */

export const atsAnalysisSchema = z.object({
  overall: z.number(),
  categories: z.object({
    keywordMatch: z.number(),
    skillsMatch: z.number(),
    formatting: z.number(),
    experienceRelevance: z.number(),
    completeness: z.number(),
  }),
  matchedKeywords: z.array(z.object({ keyword: z.string(), matched: z.boolean(), source: z.string() })),
  missingKeywords: z.array(z.object({ keyword: z.string(), matched: z.boolean(), source: z.string() })),
  matchedSkills: z.array(z.string()),
  suggestedSkills: z.array(z.string()),
  issues: z.array(z.object({ severity: z.string(), category: z.string(), message: z.string(), suggestion: z.string() })),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
  timestamp: z.string(),
})