import { createApiClient } from './client'

export async function syncProfile(token, payload = {}) {
  const api = createApiClient(token)
  const { data } = await api.post('/auth/sync-profile', payload)
  return data?.profile
}

export async function deleteAccount(token) {
  const api = createApiClient(token)
  const { data } = await api.delete('/auth/delete-account')
  return data
}