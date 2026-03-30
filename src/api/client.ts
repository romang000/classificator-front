export class ApiError extends Error {
  status?: number
  body?: unknown

  constructor(message: string, opts?: { status?: number; body?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts?.status
    this.body = opts?.body
  }
}

const defaultBaseUrl = 'http://localhost:8080'

function getBaseUrl() {
  const v = import.meta.env.VITE_API_BASE_URL
  if (typeof v === 'string' && v.trim()) return v.trim()

  if (import.meta.env.DEV) return '/api'
  return defaultBaseUrl
}

function extractErrorMessage(status: number, body: unknown): string {
  if (typeof body === 'string' && body.trim()) {
    return body
  }

  if (body && typeof body === 'object') {
    const data = body as {
      message?: string
      breeds?: string[]
    }

    if (data.message) {
      if (Array.isArray(data.breeds) && data.breeds.length > 0) {
        return `${data.message}: ${data.breeds.join(', ')}`
      }

      return data.message
    }
  }

  return `HTTP ${status}`
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl()

  const url =
    typeof input === 'string'
      ? `${baseUrl}${input.startsWith('/') ? '' : '/'}${input}`
      : input

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const contentType = res.headers.get('Content-Type') ?? ''

  if (!res.ok) {
    let body: unknown = undefined

    try {
      if (contentType.includes('application/json')) {
        body = await res.json()
      } else {
        const text = await res.text()
        body = text || undefined
      }
    } catch {
      //
    }

    throw new ApiError(extractErrorMessage(res.status, body), {
      status: res.status,
      body,
    })
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()

  if (!text) {
    return undefined as T
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T
  }

  return text as T
}