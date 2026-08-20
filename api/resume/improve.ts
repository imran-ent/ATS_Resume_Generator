import { completeJSON, json, readBody, HttpError } from '../_lib/ai'

interface ImproveBody {
  bullet: string
  context?: {
    jobTitle?: string
    company?: string
    role?: string
    technologies?: string[]
  }
  jobDescription?: string
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  let body: ImproveBody
  try {
    body = (await readBody(req)) as unknown as ImproveBody
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Bad request' }, 400)
  }

  if (!body.bullet) return json({ error: 'Missing "bullet" in request body.' }, 400)

  const techs = (body.context?.technologies ?? []).join(', ')
  const context = [
    `Job title: ${body.context?.jobTitle || ''}`,
    `Company: ${body.context?.company || ''}`,
    `Target role: ${body.context?.role || ''}`,
    techs ? `Technologies: ${techs}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const result = await completeJSON<{ improved: string }>(
      [
        {
          role: 'user' as const,
          content: `Rewrite this resume bullet to be stronger and more ATS-friendly. Use only the facts given. Do not invent metrics, numbers, or accomplishments. If it cannot be improved without inventing facts, keep it nearly verbatim with minor polish.

Original bullet: "${body.bullet}"

Context:
${context}

Return JSON shaped exactly like: { "improved": string }`,
        },
      ],
      { improved: body.bullet },
    )
    return json(result)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    return json({ error: err instanceof Error ? err.message : 'AI request failed.' }, 500)
  }
}