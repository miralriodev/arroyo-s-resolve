import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AccommodationForm from '../components/molecules/AccommodationForm'
import AccommodationList from '../components/molecules/AccommodationList'
import { createAccommodation, deleteAccommodation, listAccommodations, updateAccommodation } from '../supabase/accommodations'
import { uploadServiceImage } from '../supabase/storage'
import { useAuth } from '../supabase/AuthContext.jsx'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const ErrorText = styled.p`
  color: #d32f2f;
`

export default function Admin() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: 0, rating: 0, category: 'alojamiento', location: '', image_url: '', image_file: null })

  const load = async () => {
    setLoading(true)
    try {
      const rows = await listAccommodations()
      setItems(rows || [])
      setError('')
    } catch (e) {
      setError(`Error cargando datos: ${e.message || ''}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      let payload = { ...form }
      // Si hay archivo, subir a Storage y usar la URL pública
      if (form.image_file) {
        const { publicUrl } = await uploadServiceImage(form.image_file, editing?.id || user?.id)
        payload.image_url = publicUrl
      }
      // No enviar el File al DB
      delete payload.image_file
      // Establecer host_id para cumplir políticas RLS por dueño/admin
      payload.host_id = editing?.host_id || user?.id || null

      if (editing) {
        await updateAccommodation(editing.id, payload)
      } else {
        const created = await createAccommodation(payload)
        
        // Si se crea sin id previo y había archivo, podríamos subir con id real; por simplicidad ya se subió con 'new/'.
      }
      setForm({ title: '', description: '', price: 0, rating: 0, category: 'alojamiento', location: '', image_url: '', image_file: null })
      setEditing(null)
      await load()
    } catch (e) {
      setError(`Error guardando datos: ${e.message || ''}`)
    }
  }

  const onEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      description: item.description || '',
      price: item.price ?? 0,
      rating: item.rating ?? 0,
      category: item.category || 'alojamiento',
      location: item.location || '',
      image_url: item.image_url || '',
      image_file: null
    })
  }

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este alojamiento?')) return
    try {
      await deleteAccommodation(id)
      await load()
    } catch (e) {
      setError(`Error eliminando: ${e.message || ''}`)
    }
  }

  return (
    <Wrapper>
      <h2>Admin</h2>
      <p>Gestión de alojamientos (CRUD básico)</p>

      {error && <ErrorText>{error}</ErrorText>}
      {loading && <p>Cargando…</p>}

      <AccommodationForm
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        editing={!!editing}
        onCancel={() => { setEditing(null); setForm({ title: '', description: '', price: 0, rating: 0, category: 'alojamiento', location: '', image_url: '', image_file: null }) }}
      />

      <div>
        <h3>Listado</h3>
        <AccommodationList items={items} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </Wrapper>
  )
}