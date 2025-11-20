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

export async function listMyBookings(token) {
  const client = createApiClient(token)
  const { data } = await client.get('/bookings')
  return data
}

export async function listMyBookingsWithMeta(token, params = {}) {
  const client = createApiClient(token)
  const resp = await client.get('/bookings', { params })
  const total = Number(resp.headers['x-total-count'])
  return { items: resp.data, total: Number.isFinite(total) ? total : null }
}

export async function listHostBookings(token, params = {}) {
  const client = createApiClient(token)
  const { data } = await client.get('/bookings/host', { params })
  return data
}

export async function listHostBookingsWithMeta(token, params = {}) {
  const client = createApiClient(token)
  const resp = await client.get('/bookings/host', { params })
  const total = Number(resp.headers['x-total-count'])
  return { items: resp.data, total: Number.isFinite(total) ? total : null }
}

export async function listAllBookingsWithMeta(token, params = {}) {
  const client = createApiClient(token)
  const resp = await client.get('/admin/bookings', { params })
  const total = Number(resp.headers['x-total-count'])
  return { items: resp.data, total: Number.isFinite(total) ? total : null }
}