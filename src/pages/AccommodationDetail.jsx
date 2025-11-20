import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../supabase/AuthContext'
import { getAccommodation, listAvailability } from '../api/accommodations'
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
  const [availability, setAvailability] = useState([])
  const [availStatus, setAvailStatus] = useState(null)

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

  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailStatus(null)
      setAvailability([])
      if (!form.start_date || !form.end_date) return
      try {
        const data = await listAvailability(Number(id), { startDate: form.start_date, endDate: form.end_date })
        setAvailability(Array.isArray(data) ? data : [])
        setAvailStatus('ok')
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Error cargando disponibilidad'
        setAvailStatus(msg)
      }
    }
    fetchAvailability()
  }, [id, form.start_date, form.end_date])

  const book = async () => {
    setBookingStatus('loading')
    if (!form.start_date || !form.end_date) {
      setBookingStatus('Por favor completa ambas fechas')
      return
    }
    if (form.end_date < form.start_date) {
      setBookingStatus('La fecha de salida debe ser posterior a la de entrada')
      return
    }
    try {
      const payload = { accommodationId: Number(id), ...form }
      const token = session?.access_token
      const data = await requestBooking(token, payload)
      setBookingStatus(`Reserva ${data.status}`)
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Error al reservar'
      setBookingStatus(msg)
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
        <button onClick={book} disabled={!form.start_date || !form.end_date}>Solicitar/Reservar</button>
      </div>
      {bookingStatus && <p>{bookingStatus}</p>}

      <h3>Disponibilidad diaria</h3>
      {!form.start_date || !form.end_date ? (
        <p>Selecciona un rango de fechas para ver disponibilidad.</p>
      ) : availStatus && availStatus !== 'ok' ? (
        <p>{availStatus}</p>
      ) : availability.length === 0 ? (
        <p>No hay disponibilidad configurada para este rango.</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 100px 100px 120px', gap: 6, fontWeight: 'bold', paddingBottom: 6, borderBottom: '1px solid #ddd' }}>
            <div>Fecha</div>
            <div>Capacidad</div>
            <div>Reservado</div>
            <div>Disponible</div>
          </div>
          {availability.map((a, idx) => {
            const dateStr = new Date(a.date).toLocaleDateString()
            const available = (a.capacity ?? 0) - (a.reserved ?? 0)
            const enough = available >= (form.guests || 1)
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 100px 100px 120px', gap: 6, padding: '6px 0', borderBottom: '1px solid #f0f0f0', color: enough ? '#222' : '#b00020' }}>
                <div>{dateStr}</div>
                <div>{a.capacity}</div>
                <div>{a.reserved}</div>
                <div>{available} {enough ? '' : '(insuficiente)'}</div>
              </div>
            )
          })}
        </div>
      )}

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