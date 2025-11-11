import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getAccommodation } from '../supabase/accommodations'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

export default function ServiceDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const row = await getAccommodation(id)
        if (active) {
          setData(row)
          setError('')
        }
      } catch (e) {
        if (active) {
          setError(`No se pudo cargar el servicio (offline o no existe). ${e?.message || ''}`)
          setData(null)
        }
      } finally {
        active && setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  if (loading) return <p>Cargando...</p>
  if (error) return <p style={{ color: '#d32f2f' }}>{error}</p>
  if (!data) return <p>No se encontró el servicio.</p>

  return (
    <Wrapper>
      <h2>{data.title}</h2>
      <img src={data.image_url || '/vite.svg'} alt={data.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
      <p><strong>Precio:</strong> ${data.price}</p>
      <p><strong>Rating:</strong> ★ {data.rating}</p>
      <p><strong>Ubicación:</strong> {data.location}</p>
      <p>{data.description}</p>
    </Wrapper>
  )
}