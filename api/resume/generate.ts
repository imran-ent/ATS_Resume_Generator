import { completeJSON, json, readBody, summarizeResume, HttpError } from '../_lib/ai'

interface GenerateBody {
  resume: Record<string, unknown>
  action: string
  target?: string
  jobDescription?: string
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  let body: GenerateBody
  try {
    body = (await readBody(req)) as unknown as GenerateBody
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Bad request' }, 400)
  }

  const resume = body.resume
  if (!resume) return json({ error: 'Missing "resume" in request body.' }, 400)
  const action = body.action ?? ''
  const target = body.target
  const jobDescription = body.jobDescription

  const context = summarizeResume(resume)
  const role = (resume.targetJob as Record<string, unknown> | undefined)?.role || target || 'Software Engineer'

  const actionInstruction: Record<string, { output: string; note: string }> = {
    'generate-summary': {
      output: `{ "summary": string }`,
      note: 'Write a 3-4 sentence professional summary for the person based ONLY on the provided facts. Mention their title, relevant strengths, and target role. Do not invent achievements.',
    },
    'improve-summary': {
      output: `{ "summary": string }`,
      note: 'Improve the existing summary clarity and impact using only the provided facts. Do not invent achievements.',
    },
    'improve-bullet': {
      output: `{ "experience": [ { "company": string, "jobTitle": string, "bullets": string[] } ] }`,
      note: 'Rewrite each work experience bullet to be stronger and more ATS-friendly using only the provided facts. Start with action verbs. If a bullet cannot be improved without inventing facts, keep it nearly verbatim with minor polish.',
    },
    'generate-project-description': {
      output: `{ "projects": [ { "name": string, "description": string, "technologies": string[], "githubUrl": string|null, "liveUrl": string|null, "bullets": string[] } ] }`,
      note: 'Write a concise project description for each project based only on the provided facts.',
    },
    'recommend-skills': {
      output: `{ "skills": { "technical": [ { "label": string, "skills": string[] } ], "soft": string[] }, "keywords": string[], "suggestions": string[] }`,
      note: `Recommend skills for a ${role} role. Return a JSON object with skills and keywords.`,
    },
  }

  const instruction = actionInstruction[action] ?? {
    output: `{ "experience": [ { "company": string, "jobTitle": string, "bullets": string[] } ], "projects": [ { "name": string, "description": string } ], "keywords": string[], "suggestions": string[] }`,
    note: 'Improve the resume experience bullets and project descriptions using only the provided facts. Do not invent facts.',
  }

  const fallback = {}

  try {
    const result = await completeJSON(
      [
        {
          role: 'user' as const,
          content: `${instruction.note}\n\nReturn JSON shaped exactly like this:\n${instruction.output}\n\nResume data:\n${context}\n${target ? `Target role: ${target}` : ''}${jobDescription ? `\nJob description:\n${jobDescription}` : ''}`,
        },
      ],
      fallback,
    )
    return json(result)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    return json({ error: err instanceof Error ? err.message : 'AI request failed.' }, 500)
  }
}