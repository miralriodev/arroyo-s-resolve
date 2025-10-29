import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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
    setLoading(true)
    fetch(`/api/services/${id}.json`)
      .then((r) => r.json())
      .then((json) => { if (active) { setData(json); setError('') } })
      .catch(() => { if (active) { setError('Modo offline o servicio no cacheado'); setData(null) } })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  if (loading) return <p>Cargando...</p>
  if (error) return <p style={{ color: '#d32f2f' }}>{error}</p>
  if (!data) return <p>No se encontró el servicio.</p>

  return (
    <Wrapper>
      <h2>{data.title}</h2>
      <img src={data.image} alt={data.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
      <p><strong>Precio:</strong> ${data.price}</p>
      <p><strong>Rating:</strong> ★ {data.rating}</p>
      <p><strong>Ubicación:</strong> {data.ubicacion}</p>
      <p>{data.descripcion}</p>
    </Wrapper>
  )
}