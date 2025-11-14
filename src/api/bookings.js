import { createApiClient } from './client'

export async function requestBooking(token, payload) {
  const client = createApiClient(token)
  const { data } = await client.post('/bookings', payload)
  return data
}

export async function confirmBooking(token, id) {
  const client = createApiClient(token)
  const { data } = await client.post(`/bookings/${id}/confirm`)
  return data
}

export async function rejectBooking(token, id) {
  const client = createApiClient(token)
  const { data } = await client.post(`/bookings/${id}/reject`)
  return data
}

export async function markPaid(token, id) {
  const client = createApiClient(token)
  const { data } = await client.post(`/bookings/${id}/mark-paid`)
  return data
}

export async function getContact(token, id) {
  const client = createApiClient(token)
  const { data } = await client.get(`/bookings/${id}/contact`)
  return data
}