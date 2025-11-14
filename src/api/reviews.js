import { createApiClient } from './client'

export async function submitGuestReview(token, bookingId, body) {
  const client = createApiClient(token)
  const { data } = await client.post(`/reviews/${bookingId}/guest`, body)
  return data
}

export async function submitHostReview(token, bookingId, body) {
  const client = createApiClient(token)
  const { data } = await client.post(`/reviews/${bookingId}/host`, body)
  return data
}

export async function listAccommodationReviews(accommodationId) {
  const client = createApiClient()
  const { data } = await client.get(`/reviews/accommodation/${accommodationId}`)
  return data
}