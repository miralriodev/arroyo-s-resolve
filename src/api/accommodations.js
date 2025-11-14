import { createApiClient } from './client'

export async function searchAccommodations(params = {}) {
  const client = createApiClient()
  const { data } = await client.get('/accommodations', { params })
  return data
}

export async function getAccommodation(id) {
  const client = createApiClient()
  const { data } = await client.get(`/accommodations/${id}`)
  return data
}

export async function listAvailability(id, params = {}) {
  const client = createApiClient()
  const { data } = await client.get(`/accommodations/${id}/availability`, { params })
  return data
}

export async function createAccommodation(token, payload) {
  const client = createApiClient(token)
  const { data } = await client.post('/accommodations', payload)
  return data
}

export async function updateAccommodation(token, id, payload) {
  const client = createApiClient(token)
  const { data } = await client.put(`/accommodations/${id}`, payload)
  return data
}

export async function setAvailability(token, id, items) {
  const client = createApiClient(token)
  const { data } = await client.post(`/accommodations/${id}/availability`, items)
  return data
}