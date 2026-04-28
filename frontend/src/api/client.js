import axios from 'axios'

const DEFAULT_REMOTE_API_URL = 'https://simba-backend.onrender.com'

function resolveApiUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').trim()

  if (typeof window === 'undefined') {
    return configured || DEFAULT_REMOTE_API_URL
  }

  const isLocalPage = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const pointsToLocalApi = configured.includes('localhost') || configured.includes('127.0.0.1')

  if (!configured) {
    return isLocalPage ? 'http://localhost:8000' : DEFAULT_REMOTE_API_URL
  }

  if (!isLocalPage && pointsToLocalApi) {
    return DEFAULT_REMOTE_API_URL
  }

  return configured
}

const client = axios.create({
  baseURL: resolveApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

export default client
