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

  // Если задана прокси через vite: используем /api
  if (import.meta.env.DEV) return '/api'
  return defaultBaseUrl
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
      // ignore
    }

    throw new ApiError(`HTTP ${res.status}`, { status: res.status, body })
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

