import type { ResumeData } from '@/types/resume'

/** Demo resume used for the landing page preview and mock generation. */
export const DEMO_RESUME: ResumeData = {
  personal: {
    fullName: 'Sarah Mitchell',
    professionalTitle: 'Senior Frontend Engineer',
    photo: '',
    contact: {
      email: 'sarah.mitchell@example.com',
      phone: '+1 (415) 555-0132',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
      github: 'https://github.com/sarahmitchell',
      portfolio: 'https://sarahmitchell.dev',
    },
  },
  summary:
    'Frontend Engineer with 6 years of experience building accessible, high-performance web applications. Skilled in React, TypeScript, and modern testing practices, with a focus on clean architecture and measurable usability improvements.',
  summarySource: 'manual',
  experience: [
    {
      id: 'exp_1',
      company: 'Northwind Labs',
      jobTitle: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: null,
      current: true,
      summary: 'Owned the design system and core web platform.',
      bullets: [
        'Led migration of a 400k-line codebase from JavaScript to TypeScript, reducing runtime errors by roughly 30%.',
        'Designed and shipped a tokenized design system used by 4 product teams, cutting UI development time significantly.',
        'Improved Core Web Vitals for key pages, with LCP on the primary funnel improving from 4.1s to 1.8s.',
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Jest', 'Playwright'],
    },
    {
      id: 'exp_2',
      company: 'Acme Studios',
      jobTitle: 'Frontend Engineer',
      location: 'Portland, OR',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      summary: 'Built customer-facing web applications.',
      bullets: [
        'Developed responsive customer interfaces using React and REST APIs, improving usability across desktop and mobile.',
        'Introduced unit and integration testing, raising coverage on critical flows from 0% to 80%.',
        'Collaborated with designers to ship an accessible component library meeting WCAG 2.1 AA.',
      ],
      technologies: ['React', 'JavaScript', 'CSS Modules', 'Node.js', 'MongoDB'],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of Washington',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: '2014-09',
      endDate: '2018-06',
      gpa: '3.7',
      coursework: ['Data Structures & Algorithms', 'Human-Computer Interaction', 'Operating Systems'],
    },
  ],
  skills: {
    technical: [
      { label: 'Programming Languages', skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS'] },
      { label: 'Frameworks & Libraries', skills: ['React', 'Next.js', 'Tailwind CSS', 'Node.js'] },
      { label: 'Tools & Platforms', skills: ['Git', 'Jest', 'Playwright', 'Docker'] },
    ],
    soft: ['Communication', 'Mentoring', 'Cross-functional Collaboration'],
  },
  projects: [
    {
      id: 'proj_1',
      name: 'Component Atlas',
      description:
        'A living style guide and component explorer that documents every UI primitive with usage examples and accessibility notes.',
      technologies: ['React', 'TypeScript', 'Storybook', 'Figma'],
      githubUrl: 'https://github.com/sarahmitchell/component-atlas',
      liveUrl: 'https://component-atlas.dev',
      bullets: [
        'Automated documentation generation from component prop types, keeping docs in sync with code.',
        'Integrated visual regression testing to catch unintended UI changes in pull requests.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Developer – Associate',
      organization: 'Amazon Web Services',
      date: '2022-11',
      credentialUrl: '',
    },
  ],
  achievements: [],
  targetJob: {
    role: 'Frontend Developer',
    jobDescription: '',
  },
  template: 'modern',
  settings: {
    fontSize: 'medium',
    includePhoto: false,
  },
}

export function emptyResumeData(): ResumeData {
  return {
    personal: {
      fullName: '',
      professionalTitle: '',
      photo: '',
      contact: {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      },
    },
    summary: '',
    summarySource: 'empty',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
    achievements: [],
    targetJob: { role: '', jobDescription: '' },
    template: 'modern',
    settings: {
      fontSize: 'medium',
      includePhoto: false,
    },
  }
}