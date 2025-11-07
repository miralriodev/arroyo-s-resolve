import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Filters from '../components/molecules/Filters'
import SearchBar from '../components/molecules/SearchBar'
import ServiceCard from '../components/molecules/ServiceCard'
import { listAccommodations } from '../supabase/accommodations'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

const ErrorText = styled.p`
  color: #d32f2f;
`

const fallbackServices = [
  { id: 1, title: 'Cabaña Río', price: 1200, rating: 4.6, image: '/vite.svg', categoria: 'alojamiento', ubicacion: 'centro' },
  { id: 2, title: 'Tour Cascada', price: 800, rating: 4.8, image: '/vite.svg', categoria: 'experiencia', ubicacion: 'periferia' },
  { id: 3, title: 'Hostal Centro', price: 500, rating: 4.2, image: '/vite.svg', categoria: 'alojamiento', ubicacion: 'centro' },
]

export default function Services() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    // Primero intenta cargar desde Supabase; si falla, usa el fallback local
    ;(async () => {
      try {
        const rows = await listAccommodations()
        const mapped = (rows || []).map(r => ({
          id: r.id,
          title: r.title,
          price: r.price ?? 0,
          rating: r.rating ?? 0,
          image: r.image_url || '/vite.svg',
          categoria: r.category || 'alojamiento',
          ubicacion: r.location || 'centro',
          descripcion: r.description || ''
        }))
        if (active) { setServices(mapped); setError('') }
      } catch (_) {
        if (active) { setServices(fallbackServices); setError('Modo offline o error de red', _.message) }
      } finally {
        active && setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    let data = services.length ? services : fallbackServices
    if (query) data = data.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()))
    if (filters.categoria) data = data.filter((s) => s.categoria === filters.categoria)
    if (filters.ubicacion) data = data.filter((s) => s.ubicacion === filters.ubicacion)
    if (filters.precio === 'asc') data = [...data].sort((a, b) => a.price - b.price)
    if (filters.precio === 'desc') data = [...data].sort((a, b) => b.price - a.price)
    return data
  }, [query, filters, services])

  return (
    <Wrapper>
      <SearchBar onSearch={setQuery} />
      <Filters onChange={setFilters} />
      {loading && <p>Cargando servicios...</p>}
      {error && <ErrorText>{error}</ErrorText>}
      <Grid>
        {filtered.map((s) => (
          <ServiceCard key={s.id} image={s.image} title={s.title} price={s.price} rating={s.rating} to={`/servicios/${s.id}`} />
        ))}
      </Grid>
    </Wrapper>
  )
}