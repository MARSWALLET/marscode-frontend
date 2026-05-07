import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null }
  return {
    access: localStorage.getItem('marscoder_access_token'),
    refresh: localStorage.getItem('marscoder_refresh_token'),
  }
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem('marscoder_access_token', access)
  if (refresh) localStorage.setItem('marscoder_refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('marscoder_access_token')
  localStorage.removeItem('marscoder_refresh_token')
  localStorage.removeItem('marscoder_user')
}

function redirectToLogin() {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  if (!path.startsWith('/login') && !path.startsWith('/signup')) {
    window.location.href = '/login'
  }
}

// Track in-flight refresh to prevent concurrent refresh storms
let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processPendingQueue(token: string | null, error: unknown = null) {
  pendingQueue.forEach((prom) => {
    if (token) prom.resolve(token)
    else prom.reject(error)
  })
  pendingQueue = []
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const { access } = getTokens()
      if (access && config.headers) {
        config.headers.Authorization = `Bearer ${access}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refresh } = getTokens()

      if (!refresh) {
        clearTokens()
        redirectToLogin()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue up while refresh is in-flight
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refresh,
        })

        const { access_token, refresh_token } = res.data
        setTokens(access_token, refresh_token)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        processPendingQueue(access_token)
        return api(originalRequest)
      } catch (refreshError) {
        processPendingQueue(null, refreshError)
        clearTokens()
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
