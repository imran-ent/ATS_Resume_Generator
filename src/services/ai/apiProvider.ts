import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiImproveBulletRequest,
  AiJobAnalysis,
  AiRewriteRequest,
} from '@/types/resume'
import type { AIProvider } from './types'
import { apiRequest } from '@/services/http'

/**
 * Reaches the AI provider through the backend API. No secrets live in the
 * browser. Endpoints:
 *   POST {base}/resume/generate
 *   POST {base}/resume/improve
 *   POST {base}/resume/rewrite
 *   POST {base}/job/analyze
 */
export class ApiAIProvider implements AIProvider {
  readonly name = 'api'

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    return apiRequest<AiGenerationResponse>('/resume/generate', {
      method: 'POST',
      body: request,
    })
  }

  async improveBullet(request: AiImproveBulletRequest): Promise<{ improved: string }> {
    return apiRequest<{ improved: string }>('/resume/improve', {
      method: 'POST',
      body: request,
    })
  }

  async analyzeJob(jobDescription: string, role?: string): Promise<AiJobAnalysis> {
    return apiRequest<AiJobAnalysis>('/job/analyze', {
      method: 'POST',
      body: { jobDescription, role },
    })
  }

  async rewrite(request: AiRewriteRequest): Promise<{ result: string }> {
    return apiRequest<{ result: string }>('/resume/rewrite', {
      method: 'POST',
      body: request,
    })
  }
}