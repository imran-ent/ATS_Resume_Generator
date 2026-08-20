import type {
  AtsAnalysis,
  AtsIssue,
  AtsStatus,
  ResumeData,
} from '@/types/resume'
import { ATS_KEYWORD_POOL } from '@/data/constants'

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

function dateConsistency(resume: ResumeData) {
  const samples: string[] = []
  for (const e of resume.experience) {
    if (e.startDate) samples.push(e.startDate)
    if (!e.current && e.endDate) samples.push(e.endDate)
  }
  for (const e of resume.education) {
    if (e.startDate) samples.push(e.startDate)
    if (e.endDate) samples.push(e.endDate)
  }
  const valid = samples.filter((s) => /^\d{4}-\d{2}(-\d{2})?$/.test(s))
  return samples.length === 0 ? { complete: true, valid: true } : { complete: true, valid: valid.length === samples.length }
}

function hasUnusualChars(text: string) {
  // emoji or non-typographic symbols that can break ATS parsing
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}]/u.test(text) || /[|¦§±@#$^~`*/\\=]/g.test(text)
}

const DEFAULT_ISSUE_PRESENTATION =
  'Consider adding if you genuinely have this skill. Never add skills you do not have.'

export function analyzeResume(resume: ResumeData, jobKeywords: string[] = []): AtsAnalysis {
  const text = buildResumeText(resume)
  const role = resume.targetJob.role || 'Software Engineer'
  const pool = [...new Set([...(ATS_KEYWORD_POOL[role] ?? []), ...jobKeywords])]
  const providedSkills = [
    ...resume.skills.technical.flatMap((g) => g.skills),
    ...resume.skills.soft,
  ]

  const issues: AtsIssue[] = []
  const strengths: string[] = []

  /* ── Completeness ── */
  const checks: Array<[boolean, string]> = [
    [!!resume.personal.fullName.trim(), 'Full name is missing'],
    [!!resume.personal.professionalTitle.trim(), 'Professional title is missing'],
    [!!resume.personal.contact.email.trim(), 'Email is missing'],
    [!!resume.summary.trim(), 'Professional summary is missing'],
    [resume.experience.length > 0, 'No work experience added'],
    [resume.education.length > 0, 'No education added'],
    [resume.skills.technical.flatMap((g) => g.skills).length > 0, 'No technical skills added'],
  ]
  const done = checks.filter(([ok]) => ok).length
  const completeness = Math.round((done / checks.length) * 100)

  /* ── Formatting ── */
  const dates = dateConsistency(resume)
  const unusual = hasUnusualChars(text)
  const hasSections =
    resume.experience.length > 0 &&
    resume.education.length > 0 &&
    resume.skills.technical.length > 0
  const headingNames = [
    resume.summary.trim() ? 'SUMMARY' : null,
    resume.experience.length > 0 ? 'EXPERIENCE' : null,
    resume.education.length > 0 ? 'EDUCATION' : null,
    resume.skills.technical.length > 0 ? 'SKILLS' : null,
    resume.projects.length > 0 ? 'PROJECTS' : null,
  ].filter(Boolean)

  let formatting = 95
  if (!dates.valid) {
    formatting -= 20
    issues.push({
      severity: 'error',
      category: 'Formatting',
      message: 'Inconsistent date formats detected.',
      suggestion: 'Use the same format for every date, e.g. "2023-01".',
    })
  }
  if (unusual) {
    formatting -= 25
    issues.push({
      severity: 'error',
      category: 'Formatting',
      message: 'Unusual symbols or emoji found in the resume text.',
      suggestion: 'Remove decorative symbols. ATS parsers can misread them.',
    })
  }
  if (!hasSections) {
    formatting -= 10
    issues.push({
      severity: 'warning',
      category: 'Formatting',
      message: 'A few core sections are empty.',
      suggestion: 'Add experience, education, and skills so ATS parsers can map standard sections.',
    })
  }
  if (headingNames.length === 0) {
    formatting -= 15
    issues.push({
      severity: 'warning',
      category: 'Formatting',
      message: 'No standard section headings detected.',
      suggestion: 'Use standard headings like SUMMARY, EXPERIENCE, EDUCATION, SKILLS.',
    })
  }
  formatting = clamp(formatting)

  /* ── Keywords & skills match ── */
  const keywordResults = pool.map((kw) => ({
    keyword: kw,
    matched: text.toLowerCase().includes(kw.toLowerCase()),
    source: jobKeywords.includes(kw) ? ('required' as const) : ('general' as const),
  }))
  const matchedKeywords = keywordResults.filter((k) => k.matched)
  const missingKeywords = keywordResults.filter((k) => !k.matched)
  const keywordMatch = Math.round((matchedKeywords.length / Math.max(1, pool.length)) * 100)

  const matchedSkills = providedSkills.filter((s) =>
    text.toLowerCase().includes(s.toLowerCase()),
  )
  const suggestedSkills = missingKeywords
    .map((k) => k.keyword)
    .filter((k) => !providedSkills.some((s) => s.toLowerCase() === k.toLowerCase()))
  const skillsMatch = pool.length
    ? Math.round(
        (providedSkills.filter((s) => pool.some((k) => k.toLowerCase() === s.toLowerCase())).length /
          Math.max(1, pool.length)) *
          100,
      )
    : 75

  /* ── Experience relevance ── */
  const expTechs = resume.experience.flatMap((e) => [
    e.jobTitle,
    ...e.technologies,
    ...e.bullets.join(' ').split(' '),
  ])
  const relevant = expTechs.filter((t) =>
    pool.some((k) => k.toLowerCase() === t.toLowerCase()),
  ).length
  const experienceRelevance = resume.experience.length
    ? clamp(60 + (relevant / Math.max(1, expTechs.length)) * 40)
    : 0

  if (resume.experience.length === 0) {
    issues.push({
      severity: 'error',
      category: 'Experience',
      message: 'Work experience is empty.',
      suggestion: 'Add at least one role so recruiters can assess your background.',
    })
  }

  /* ── Overall ── */
  const overall = Math.round(
    keywordMatch * 0.3 + skillsMatch * 0.2 + formatting * 0.2 + experienceRelevance * 0.15 + completeness * 0.15,
  )

  if (overall >= 75) strengths.push('Strong overall structure — easily parseable by ATS.')
  if (keywordMatch >= 70) strengths.push('Good keyword coverage for the target role.')
  if (formatting >= 90) strengths.push('Clean, consistent formatting.')
  if (completeness >= 90) strengths.push('All core sections are filled out.')
  if (experienceRelevance >= 70) strengths.push('Experience aligns well with the target role.')
  if (strengths.length === 0) strengths.push('Your resume has a solid foundation — follow the suggestions to improve it.')

  if (missingKeywords.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Keywords',
      message: `${missingKeywords.length} keyword${missingKeywords.length === 1 ? '' : 's'} from the target role not found.`,
      suggestion: `${DEFAULT_ISSUE_PRESENTATION} Example keywords: ${missingKeywords.slice(0, 5).map((k) => k.keyword).join(', ')}.`,
    })
  }
  if (resume.skills.technical.flatMap((g) => g.skills).length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Skills',
      message: 'No technical skills listed.',
      suggestion: 'List the technologies and tools you actually use in your work.',
    })
  }

  const suggestions = issues
    .filter((i) => i.severity !== 'info')
    .map((i) => i.suggestion)

  return {
    overall: clamp(overall),
    categories: {
      keywordMatch: clamp(keywordMatch),
      skillsMatch: clamp(skillsMatch),
      formatting: clamp(formatting),
      experienceRelevance: clamp(experienceRelevance),
      completeness: clamp(completeness),
    },
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    suggestedSkills,
    issues,
    strengths,
    suggestions: [...new Set(suggestions)],
    summary: overall >= 80 ? 'Excellent ATS compatibility. Ready to apply.' : overall >= 60 ? 'Good foundation with room to improve keyword alignment.' : 'Needs work to become ATS-ready. Follow the suggestions below.',
    timestamp: new Date().toISOString(),
  }
}

export function atsStatus(score: number): AtsStatus {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'needs-work'
}

function buildResumeText(resume: ResumeData) {
  const parts: string[] = [
    resume.personal.fullName,
    resume.personal.professionalTitle,
    resume.personal.contact.email,
    resume.personal.contact.phone,
    resume.personal.contact.location,
    resume.personal.contact.linkedin,
    resume.personal.contact.github,
    resume.personal.contact.portfolio,
    resume.summary,
    ...resume.experience.flatMap((e) => [
      e.company,
      e.jobTitle,
      e.summary,
      ...e.bullets,
      ...e.technologies,
    ]),
    ...resume.education.flatMap((e) => [e.institution, e.degree, e.fieldOfStudy, ...e.coursework]),
    ...resume.skills.technical.flatMap((g) => g.skills),
    ...resume.skills.soft,
    ...resume.projects.flatMap((p) => [p.name, p.description, ...p.technologies, ...p.bullets]),
    ...resume.certifications.flatMap((c) => [c.name, c.organization]),
    ...resume.achievements.flatMap((a) => [a.title, a.organization, a.description]),
  ]
  return parts.filter(Boolean).join(' ')
}

/** Deterministic coverage of job description keywords without an AI call. */
export function extractJdKeywords(jobDescription: string, role?: string) {
  const pool = role ? (ATS_KEYWORD_POOL[role] ?? []) : []
  const jd = jobDescription.toLowerCase()
  return [...new Set(pool.filter((k) => jd.includes(k.toLowerCase())))].slice(0, 40)
}

/** Lightweight ATS-style analysis of raw pasted resume text. */
export function analyzeText(text: string, role = 'Software Engineer'): AtsAnalysis {
  const issues: AtsIssue[] = []
  const strengths: string[] = []
  const clean = text.replace(/\s+/g, ' ').trim()
  const lower = clean.toLowerCase()

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(clean)
  const hasPhone = /(\+?\d[\d\s().-]{7,})/.test(clean)
  const hasLinkedin = /linkedin\.com/.test(lower)
  const hasGithub = /github\.com/.test(lower)
  const sectionNames = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
  const foundSections = sectionNames.filter((s) => lower.includes(s))
  const words = clean.split(/\s+/).filter(Boolean).length

  let formatting = 88
  if (hasEmoji(clean)) {
    formatting -= 18
    issues.push({
      severity: 'error',
      category: 'Formatting',
      message: 'Emoji or decorative symbols detected.',
      suggestion: 'Remove decorative symbols — ATS parsers can misread or drop them.',
    })
  }
  if (/(^|\n)\s*[|¦§@#$^~`]/.test(clean)) {
    formatting -= 10
  }
  if (words < 150) {
    formatting -= 12
    issues.push({
      severity: 'warning',
      category: 'Formatting',
      message: 'Resume text looks very short.',
      suggestion: 'Expand each role with 3–5 concrete bullets.',
    })
  }
  formatting = clamp(formatting)

  const pool = ATS_KEYWORD_POOL[role] ?? []
  const keywordResults = pool.map((kw) => ({
    keyword: kw,
    matched: lower.includes(kw.toLowerCase()),
    source: 'general' as const,
  }))
  const matchedKeywords = keywordResults.filter((k) => k.matched)
  const missingKeywords = keywordResults.filter((k) => !k.matched)
  const keywordMatch = Math.round((matchedKeywords.length / Math.max(1, pool.length)) * 100)

  const providedSkills = pool.filter((s) => lower.includes(s.toLowerCase()))
  const suggestedSkills = missingKeywords.map((k) => k.keyword)
  const skillsMatch = pool.length
    ? Math.round((providedSkills.length / pool.length) * 100)
    : 70

  const checks: Array<[boolean, string]> = [
    [words > 50, 'Very little text provided'],
    [hasEmail, 'No email address detected'],
    [hasPhone, 'No phone number detected'],
    [hasLinkedin || hasGithub, 'No LinkedIn or GitHub link detected'],
    [foundSections.length >= 3, 'Few standard sections detected (look for Summary, Experience, Education, Skills)'],
    [words >= 200, 'Below the typical 200+ word target for an experienced resume'],
  ]
  const done = checks.filter(([ok]) => ok).length
  const completeness = Math.round((done / checks.length) * 100)

  const experienceRelevance = keywordMatch

  const overall = Math.round(
    keywordMatch * 0.3 + skillsMatch * 0.2 + formatting * 0.2 + experienceRelevance * 0.15 + completeness * 0.15,
  )

  if (hasEmail && hasPhone) strengths.push('Contact information detected — easily reachable.')
  if (hasLinkedin || hasGithub) strengths.push('Professional profile links included.')
  if (foundSections.length >= 3) strengths.push('Standard section headings present.')
  if (keywordMatch >= 60) strengths.push('Reasonable keyword coverage for the target role.')
  if (strengths.length === 0) strengths.push('Keep going — the suggestions below will get this ATS-ready.')

  if (missingKeywords.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Keywords',
      message: `${missingKeywords.length} keyword${missingKeywords.length === 1 ? '' : 's'} for a ${role} role not found.`,
      suggestion: `Consider adding if you genuinely have the skill. Examples: ${missingKeywords.slice(0, 6).map((k) => k.keyword).join(', ')}.`,
    })
  }

  return {
    overall: clamp(overall),
    categories: {
      keywordMatch: clamp(keywordMatch),
      skillsMatch: clamp(skillsMatch),
      formatting: clamp(formatting),
      experienceRelevance: clamp(experienceRelevance),
      completeness: clamp(completeness),
    },
    matchedKeywords,
    missingKeywords,
    matchedSkills: providedSkills,
    suggestedSkills,
    issues,
    strengths,
    suggestions: issues.filter((i) => i.severity !== 'info').map((i) => i.suggestion),
    summary: overall >= 80 ? 'Excellent ATS compatibility. Ready to apply.' : overall >= 60 ? 'Good foundation with room to improve keyword alignment.' : 'Needs work to become ATS-ready. Follow the suggestions below.',
    timestamp: new Date().toISOString(),
  }
}

function hasEmoji(text: string) {
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{FE0F}]/u.test(text)
}