/* Shared helpers for Vercel serverless functions. No third-party deps. */

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Invalid JSON body.')
  }
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const SYSTEM_RULES = `You are ResumeForge AI, a professional resume-writing assistant.
Strict rules you must always follow:
1. NEVER invent facts. Only rewrite, rephrase, or restructure information the user actually provided. Never fabricate metrics, numbers, percentages, companies, degrees, or credentials.
2. If a requested improvement cannot be made without inventing facts, keep the original wording and only polish grammar and tone.
3. Use clear, concise, ATS-friendly language. Start bullet points with strong action verbs.
4. Output ONLY valid JSON matching the exact schema requested. No markdown, no code fences, no extra prose.`

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Calls the configured AI provider and parses the model's JSON reply.
 * Returns `fallback` if the model does not return parseable JSON.
 */
export async function completeJSON<T>(messages: ChatMessage[], fallback: T): Promise<T> {
  const provider = (process.env.AI_PROVIDER ?? 'openai').toLowerCase()
  const apiKey = process.env.AI_API_KEY

  if (!apiKey) {
    throw new HttpError(
      500,
      'AI_API_KEY is not configured. Add it as a server-only environment variable in Vercel.',
    )
  }

  const model =
    process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini')
  const maxTokens = Number(process.env.AI_MAX_TOKENS || 2000)
  const temperature = Number(process.env.AI_TEMPERATURE || 0.7)

  const fullMessages: ChatMessage[] = [{ role: 'system', content: SYSTEM_RULES }, ...messages]

  let raw: string
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: fullMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n') }] },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: maxTokens,
          temperature,
        },
      }),
    })
    if (!res.ok) {
      throw new HttpError(502, `Gemini API error ${res.status}: ${await res.text()}`)
    }
    const data = await res.json()
    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        response_format: { type: 'json_object' },
        messages: fullMessages,
      }),
    })
    if (!res.ok) {
      throw new HttpError(502, `OpenAI API error ${res.status}: ${await res.text()}`)
    }
    const data = await res.json()
    raw = data?.choices?.[0]?.message?.content ?? ''
  }

  const cleaned = raw.replace(/```json|```/g, '').trim()
  if (!cleaned) return fallback
  try {
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

export function summarizeResume(resume: Record<string, unknown>): string {
  const p = (resume.personal ?? {}) as Record<string, unknown>
  const target = (resume.targetJob ?? {}) as Record<string, unknown>
  const experience = (resume.experience ?? []) as Array<Record<string, unknown>>
  const education = (resume.education ?? []) as Array<Record<string, unknown>>
  const projects = (resume.projects ?? []) as Array<Record<string, unknown>>
  const skills = (resume.skills ?? {}) as Record<string, unknown>

  const expText = experience
    .map((e) => {
      const techs = (e.technologies ?? []).join(', ')
      const bullets = (e.bullets ?? []).map((b: unknown) => `- ${b}`).join('\n')
      return `${e.jobTitle} @ ${e.company}${e.startDate ? ` (${e.startDate}–${e.endDate || 'present'})` : ''}${techs ? ` [${techs}]` : ''}\n${bullets}`
    })
    .join('\n\n')
  const eduText = education.map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.institution}`).join('\n')
  const projText = projects
    .map((p) => `${p.name}${p.technologies ? ` [${(p.technologies as string[]).join(', ')}]` : ''}\n${(p.bullets ?? []).map((b: unknown) => `- ${b}`).join('\n')}`)
    .join('\n\n')
  const skillText = [
    ...((skills.technical ?? []) as Array<Record<string, unknown>>).map((g) => g.label ? `${g.label}: ${(g.skills as string[]).join(', ')}` : (g.skills as string[]).join(', ')),
    ...((skills.soft ?? []) as string[]),
  ].join('\n')

  return [
    `Name: ${p.fullName}`,
    `Title: ${p.professionalTitle || ''}`,
    `Target role: ${target.role || ''}`,
    `Summary: ${resume.summary || ''}`,
    `\nEXPERIENCE:\n${expText || '(none provided)'}`,
    `\nEDUCATION:\n${eduText || '(none provided)'}`,
    `\nPROJECTS:\n${projText || '(none provided)'}`,
    `\nSKILLS:\n${skillText || '(none provided)'}`,
  ].join('\n')
}