import { completeJSON, json, readBody, HttpError } from '../_lib/ai'

interface AnalyzeBody {
  jobDescription: string
  role?: string
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  let body: AnalyzeBody
  try {
    body = (await readBody(req)) as unknown as AnalyzeBody
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Bad request' }, 400)
  }

  if (!body.jobDescription) {
    return json({ error: 'Missing "jobDescription" in request body.' }, 400)
  }

  try {
    const result = await completeJSON<Record<string, unknown>>(
      [
        {
          role: 'user' as const,
          content: `Analyze this job description and extract structured information for resume optimization.

Job description:
${body.jobDescription}
${body.role ? `\nStated role: ${body.role}` : ''}

Return JSON shaped exactly like:
{
  "requiredSkills": string[],
  "preferredSkills": string[],
  "technologies": string[],
  "responsibilities": string[],
  "keywords": string[],
  "seniority": string,
  "educationRequirements": string[],
  "estimatedRole": string
}

Rules:
- "requiredSkills" and "preferredSkills" must be properly capitalized names (e.g. "React", "TypeScript", "Spring Boot").
- "keywords" is a merged list of skills, technologies, and general keywords (communication, collaboration, agile, etc.).
- "responsibilities" is a list of 1-8 responsibility statements derived from the description.
- "estimatedRole" is your best guess at the exact job title.`,
        },
      ],
      {
        requiredSkills: [],
        preferredSkills: [],
        technologies: [],
        responsibilities: [],
        keywords: [],
        seniority: 'Mid-level',
        educationRequirements: [],
        estimatedRole: body.role ?? 'Software Engineer',
      },
    )
    return json({ ...result, timestamp: new Date().toISOString() })
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    return json({ error: err instanceof Error ? err.message : 'AI request failed.' }, 500)
  }
}