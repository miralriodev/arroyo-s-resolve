import { useState } from 'react'
import { useAuth } from '../supabase/AuthContext'
import { createAccommodation, setAvailability } from '../api/accommodations'

export default function HostDashboard() {
  const { session } = useAuth()
  const token = session?.access_token
  const [form, setForm] = useState({ title: '', description: '', price: 0, location: '', image_url: '', property_type: '', amenities: '', rules: '', max_guests: 1, instant_book: false, address: '' })
  const [availability, setAvail] = useState({ accommodationId: '', date: '', capacity: 1 })
  const [status, setStatus] = useState(null)

  const createAcc = async () => {
    setStatus('Creando…')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        image_url: form.image_url,
        property_type: form.property_type,
        amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        rules: form.rules,
        max_guests: Number(form.max_guests),
        instant_book: !!form.instant_book,
        address: form.address,
      }
      const acc = await createAccommodation(token, payload)
      setStatus(`Creado: ${acc.id}`)
    } catch (e) {
      setStatus(e?.message || 'Error creando alojamiento')
    }
  }

  const setAccAvailability = async () => {
    setStatus('Actualizando disponibilidad…')
    try {
      const items = [{ date: availability.date, capacity: Number(availability.capacity) }]
      await setAvailability(token, Number(availability.accommodationId), items)
      setStatus('Disponibilidad actualizada')
    } catch (e) {
      setStatus(e?.message || 'Error actualizando disponibilidad')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Panel de Anfitrión</h2>
      <h3>Crear anuncio</h3>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Precio por noche" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Tipo de propiedad" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} />
        <input placeholder="Servicios (csv)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
        <input placeholder="Foto (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="Reglas" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
        <input placeholder="Máx huéspedes" type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: e.target.value })} />
        <label>
          <input type="checkbox" checked={form.instant_book} onChange={(e) => setForm({ ...form, instant_book: e.target.checked })} /> Reserva Inmediata
        </label>
        <input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <button onClick={createAcc}>Crear alojamiento</button>
      </div>

      <h3 style={{ marginTop: 24 }}>Disponibilidad</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Alojamiento ID" value={availability.accommodationId} onChange={(e) => setAvail({ ...availability, accommodationId: e.target.value })} />
        <input type="date" value={availability.date} onChange={(e) => setAvail({ ...availability, date: e.target.value })} />
        <input type="number" min={1} value={availability.capacity} onChange={(e) => setAvail({ ...availability, capacity: e.target.value })} />
        <button onClick={setAccAvailability}>Guardar disponibilidad</button>
      </div>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </div>
  )
}