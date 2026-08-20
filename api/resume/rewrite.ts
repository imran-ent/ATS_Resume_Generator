import { completeJSON, json, readBody, HttpError } from '../_lib/ai'

type RewriteAction =
  | 'improve'
  | 'shorten'
  | 'make-technical'
  | 'make-professional'
  | 'add-keywords'
  | 'fix-grammar'

interface RewriteBody {
  text: string
  action: RewriteAction
  role?: string
  context?: string
}

const ACTION_HINTS: Record<RewriteAction, string> = {
  improve: 'Improve clarity, flow, and impact while keeping the same meaning. Use strong action verbs.',
  shorten: 'Make it concise. Cut filler words and redundancy while keeping the core meaning.',
  'make-technical': 'Make it sound more technical and specific using the context (technologies/tools) when available. Do not invent specifics that are not provided.',
  'make-professional': 'Remove informal language and make it polished and professional.',
  'add-keywords': 'Keep the meaning and naturally weave in relevant keywords for the target role. Do not add skills the user has not mentioned.',
  'fix-grammar': 'Fix grammar, punctuation, and spelling only. Do not change meaning.',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  let body: RewriteBody
  try {
    body = (await readBody(req)) as unknown as RewriteBody
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Bad request' }, 400)
  }

  if (!body.text) return json({ error: 'Missing "text" in request body.' }, 400)
  const action = body.action || 'improve'

  try {
    const result = await completeJSON<{ result: string }>(
      [
        {
          role: 'user' as const,
          content: `${ACTION_HINTS[action]}

Original text: "${body.text}"
${body.role ? `Target role: ${body.role}` : ''}${body.context ? `\nContext: ${body.context}` : ''}

Return JSON shaped exactly like: { "result": string }`,
        },
      ],
      { result: body.text },
    )
    return json(result)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    return json({ error: err instanceof Error ? err.message : 'AI request failed.' }, 500)
  }
}