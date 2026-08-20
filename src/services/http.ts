const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers, signal } = options

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
    throw new ApiError(
      'Network error. Check your connection and try again.',
      0,
      'NETWORK',
    )
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`
    let code: string | undefined
    try {
      const data = await response.json()
      if (data?.error) message = data.error
      if (data?.code) code = data.code
    } catch {
      /* non-JSON error body */
    }
    if (response.status === 429) {
      message = 'You have hit the rate limit. Please wait a moment and try again.'
    }
    if (response.status === 401 || response.status === 403) {
      message = 'Your session has expired. Please sign in again.'
    }
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}