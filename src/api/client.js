import axios from 'axios'

const DEFAULT_BASE_URL = '/api/v1'

export function createApiClient(token) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
  const instance = axios.create({ baseURL, timeout: 10000 })

  instance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'
    return config
  })

  return instance
}