import type { AIProvider } from './types'
import { MockAIProvider } from './mockProvider'
import { ApiAIProvider } from './apiProvider'

/**
 * Selects the active AI provider.
 *
 * The frontend always goes through `getAIProvider()`, so swapping providers
 * never touches calling code. Defaults to the mock provider so the entire
 * product is demonstrable without any API key.
 */
let instance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (instance) return instance
  const mode = (import.meta.env.VITE_AI_MODE ?? 'mock').toLowerCase()
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  instance = mode === 'api' && base ? new ApiAIProvider() : new MockAIProvider()
  return instance
}

export const aiProvider = {
  generate: (request: Parameters<AIProvider['generate']>[0]) =>
    getAIProvider().generate(request),
  improveBullet: (request: Parameters<AIProvider['improveBullet']>[0]) =>
    getAIProvider().improveBullet(request),
  analyzeJob: (jobDescription: string, role?: string) =>
    getAIProvider().analyzeJob(jobDescription, role),
  rewrite: (request: Parameters<AIProvider['rewrite']>[0]) =>
    getAIProvider().rewrite(request),
}

export const AI_MODE_LABEL: Record<string, string> = {
  mock: 'Demo mode (Mock AI)',
  api: 'Connected to AI API',
}