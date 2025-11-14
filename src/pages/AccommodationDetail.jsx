import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../supabase/AuthContext'
import { getAccommodation } from '../api/accommodations'
import { requestBooking } from '../api/bookings'
import { listAccommodationReviews } from '../api/reviews'

export default function AccommodationDetail() {
  const { id } = useParams()
  const { session } = useAuth()
  const [acc, setAcc] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ start_date: '', end_date: '', guests: 1 })
  const [loading, setLoading] = useState(true)
  const [bookingStatus, setBookingStatus] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAccommodation(id)
        setAcc(data)
        const rev = await listAccommodationReviews(id)
        setReviews(rev)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const book = async () => {
    setBookingStatus('loading')
    try {
      const payload = { accommodationId: Number(id), ...form }
      const token = session?.access_token
      const data = await requestBooking(token, payload)
      setBookingStatus(`Reserva ${data.status}`)
    } catch (e) {
      setBookingStatus(e?.message || 'Error al reservar')
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>
  if (!acc) return <div style={{ padding: 16 }}>No encontrado</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>{acc.title}</h2>
      <div>{acc.location} · ${Number(acc.price)} · Máx {acc.max_guests} huéspedes</div>
      {acc.image_url && <img src={acc.image_url} alt={acc.title} style={{ width: 400, height: 240, objectFit: 'cover' }} />}
      <p>{acc.description}</p>
      <p>Tipo: {acc.property_type} · Instant Book: {acc.instant_book ? 'Sí' : 'No'}</p>
      {Array.isArray(acc.amenities) && acc.amenities.length > 0 && (
        <p>Servicios: {acc.amenities.join(', ')}</p>
      )}
      <h3>Reservar</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        <input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
        <button onClick={book}>Solicitar/Reservar</button>
      </div>
      {bookingStatus && <p>{bookingStatus}</p>}

      <h3>Reseñas</h3>
      {reviews.length === 0 ? <p>Sin reseñas aún</p> : (
        <ul>
          {reviews.map((r, idx) => (
            <li key={idx}>
              Huésped: {r.guest_rating ?? '-'} {r.guest_comment ?? ''} | Anfitrión: {r.host_rating ?? '-'} {r.host_comment ?? ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}