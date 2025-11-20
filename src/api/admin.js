import { createApiClient } from './client'

// Admin Bookings
export async function adminGetBooking(token, id) {
  const client = createApiClient(token)
  const resp = await client.get(`/admin/bookings/${id}`)
  return resp.data
}

export async function adminUpdateBooking(token, id, payload) {
  const client = createApiClient(token)
  const resp = await client.patch(`/admin/bookings/${id}`, payload)
  return resp.data
}

export async function adminUpdateBookingStatus(token, id, status) {
  const client = createApiClient(token)
  const resp = await client.patch(`/admin/bookings/${id}/status`, { status })
  return resp.data
}

export async function adminUpdateBookingPayment(token, id, paid) {
  const client = createApiClient(token)
  const resp = await client.patch(`/admin/bookings/${id}/payment`, { paid })
  return resp.data
}

// Admin Users
export async function listUsersWithMeta(token, params = {}) {
  const client = createApiClient(token)
  const resp = await client.get('/admin/users', { params })
  const total = Number(resp.headers['x-total-count'])
  return { items: resp.data, total: Number.isFinite(total) ? total : null }
}

export async function updateUserRole(token, id, role) {
  const client = createApiClient(token)
  const resp = await client.patch(`/admin/users/${id}/role`, { role })
  return resp.data
}