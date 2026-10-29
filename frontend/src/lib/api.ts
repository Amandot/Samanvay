import axios, { AxiosError } from 'axios'

function getBaseUrl(): string {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
  let base = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase

  if (typeof window !== 'undefined') {
    // 1. Upgrade http:// to https:// when viewing over HTTPS (prevents mobile Mixed Content blocking)
    if (window.location.protocol === 'https:' && base.startsWith('http://')) {
      base = base.replace(/^http:\/\//i, 'https://')
    }

    // 2. If base points to localhost/127.0.0.1 but the site is loaded from a mobile device or network IP:
    // Dynamically replace localhost with the host of the current page so mobile devices reach the host machine
    if (base && (base.includes('localhost') || base.includes('127.0.0.1'))) {
      const host = window.location.hostname
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        base = base.replace(/localhost|127\.0\.0\.1/g, host)
      }
    }
  }

  return base
}

export const API_BASE = getBaseUrl()

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.includes('/api/auth/login')) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item: any) => {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : ''
          return `${field ? `${field}: ` : ''}${item.msg}`
        })
        .join(', ')
    }
    if (error.response?.data?.message) return String(error.response.data.message)
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Please verify the backend is running and reachable.'
    }
    return error.message || 'Something went wrong'
  }
  return error instanceof Error ? error.message : 'Something went wrong'
}

export async function loginRequest(email: string, password: string) {
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)
  const response = await api.post('/api/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return response.data as { access_token: string; token_type: string }
}

export function warmBackend() {
  try {
    // Non-blocking background ping to wake up free-tier cloud instances (e.g. Render)
    api.get('/health', { timeout: 30000 }).catch(() => {
      // Suppress background ping errors
    })
  } catch {
    // Non-blocking
  }
}

