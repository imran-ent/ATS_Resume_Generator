import type { TemplateId } from '@/types/resume'

export const APP_NAME = 'ResumeForge AI'

export const ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Backend Developer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'Product Manager',
  'QA Engineer',
  'Machine Learning Engineer',
]

export const WIZARD_STEPS = [
  { id: 'personal', label: 'Personal', index: '01' },
  { id: 'experience', label: 'Experience', index: '02' },
  { id: 'education', label: 'Education', index: '03' },
  { id: 'skills', label: 'Skills', index: '04' },
  { id: 'projects', label: 'Projects', index: '05' },
  { id: 'target', label: 'Target Job', index: '06' },
  { id: 'generate', label: 'AI Generation', index: '07' },
  { id: 'review', label: 'Review', index: '08' },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Tools & Platforms',
  'Other',
]

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  {
    id: 'executive',
    name: 'Executive',
    description: 'Minimal, elegant, traditional. Serif headings with a clean single column.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean modern typography with subtle visual hierarchy and a refined sidebar-less layout.',
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Optimized for software engineers. Dense, keyword-forward, section driven.',
  },
]

export const ATS_KEYWORD_POOL: Record<string, string[]> = {
  'Software Engineer': ['API', 'REST', 'SQL', 'Git', 'Testing', 'CI/CD', 'Agile', 'Microservices', 'Algorithms'],
  'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Responsive', 'Accessibility', 'Performance'],
  'Backend Developer': ['Node.js', 'Java', 'Spring Boot', 'REST', 'SQL', 'NoSQL', 'Message Queues', 'Caching'],
  'Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'REST', 'SQL', 'Git', 'Docker', 'CI/CD'],
  'Java Backend Developer': ['Java', 'Spring Boot', 'Hibernate', 'REST API', 'SQL', 'JUnit', 'Maven', 'Microservices'],
  'Data Analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization'],
  'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Monitoring', 'Shell Scripting'],
  'Mobile Developer': ['React Native', 'Swift', 'Kotlin', 'Flutter', 'REST', 'State Management', 'Push Notifications'],
  'Product Manager': ['Roadmap', 'Stakeholder', 'Agile', 'User Research', 'Analytics', 'A/B Testing', 'Prioritization'],
  'QA Engineer': ['Test Automation', 'Selenium', 'Jest', 'Regression', 'CI/CD', 'Bug Tracking', 'Agile'],
  'Machine Learning Engineer': ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Feature Engineering', 'Model Deployment'],
}

export const AI_LOADING_STATES = [
  'Analyzing your experience…',
  'Matching keywords…',
  'Optimizing your summary…',
  'Improving your bullet points…',
  'Finalizing your resume…',
]

export const TRUST_INDICATORS = [
  { title: 'ATS Optimized', description: 'Formatted for applicant tracking systems' },
  { title: 'AI Assisted', description: 'Professional writing, grounded in your facts' },
  { title: 'Recruiter Friendly', description: 'Clear hierarchy, scannable sections' },
  { title: 'PDF Ready', description: 'Pixel-clean A4 export with selectable text' },
]

export const FEATURES = [
  { title: 'AI Resume Generation', description: 'Professional content generated strictly from the information you provide.' },
  { title: 'ATS Optimization', description: 'Formatting and structure that applicant tracking systems can parse.' },
  { title: 'Job Description Matching', description: 'Paste any JD and see exactly where your resume aligns.' },
  { title: 'Keyword Analysis', description: 'Matched vs. missing keywords surfaced with honest guidance.' },
  { title: 'Professional Templates', description: 'Three refined, ATS-safe designs. No decorative noise.' },
  { title: 'Real-Time Resume Preview', description: 'A live A4 preview that updates as you type.' },
  { title: 'AI Writing Assistant', description: 'Improve, shorten, or rephrase any bullet in context.' },
  { title: 'PDF Export', description: 'Print-quality A4 export with selectable, copyable text.' },
]

export const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us about yourself', description: 'Add your experience, education, skills, and projects.' },
  { step: '02', title: 'Choose your target role', description: 'Pick a role and optionally paste the job description.' },
  { step: '03', title: 'Let AI optimize your resume', description: 'AI rewrites your content to be clear, professional, and keyword-aware.' },
  { step: '04', title: 'Review your ATS score', description: 'See an estimated compatibility score with actionable suggestions.' },
  { step: '05', title: 'Download and apply', description: 'Export a polished, recruiter-ready PDF in one click.' },
]