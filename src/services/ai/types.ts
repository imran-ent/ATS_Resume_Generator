import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiImproveBulletRequest,
  AiJobAnalysis,
  AiRewriteRequest,
} from '@/types/resume'

/**
 * Abstraction over AI providers. The frontend never touches API keys —
 * real providers are reached through the backend API (`ApiAIProvider`).
 * `MockAIProvider` powers the demo / offline flow.
 */
export interface AIProvider {
  readonly name: string
  generate(request: AiGenerationRequest): Promise<AiGenerationResponse>
  improveBullet(request: AiImproveBulletRequest): Promise<{ improved: string }>
  analyzeJob(jobDescription: string, role?: string): Promise<AiJobAnalysis>
  rewrite(request: AiRewriteRequest): Promise<{ result: string }>
}