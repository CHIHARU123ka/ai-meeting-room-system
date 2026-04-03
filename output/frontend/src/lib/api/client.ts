const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiError extends Error {
  status: number
  errors?: string[]

  constructor(message: string, status: number, errors?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.token || null
    }
  } catch {
    return null
  }
  return null
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options

  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    let errorMessage = 'API request failed'
    let errors: string[] | undefined
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errors = errorData.errors
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(errorMessage, response.status, errors)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

export { ApiError }
