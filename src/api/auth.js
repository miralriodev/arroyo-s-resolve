import { createApiClient } from './client'

export async function syncProfile(token, payload = {}) {
  const api = createApiClient(token)
  const { data } = await api.post('/auth/sync-profile', payload)
  return data?.profile
}