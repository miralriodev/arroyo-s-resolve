
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../supabase/AuthContext'
import styled from 'styled-components'
import { searchAccommodations } from '../api/accommodations'
import Select from '../components/atoms/Select'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import ServiceCard from '../components/molecules/ServiceCard'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Hero = styled.section`
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(5)};
  background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryDark});
  color: ${({ theme }) => theme.colors.textLight};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  h2 {
    color: ${({ theme }) => theme.colors.textLight};
  }
`

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: ${({ theme }) => theme.spacing(3)};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`

const SectionTitle = styled.h2`
  padding-left: ${({ theme }) => theme.spacing(5)};
`

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: stretch;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export default function Accommodations() {
  const { user } = useAuth()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating_desc')
  const [filters, setFilters] = useState({ location: '', startDate: '', endDate: '', guests: 1 })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const fetch = async () => {
    setLoading(true)
    try {
      const params = { ...filters }
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k])
      const data = await searchAccommodations(params)
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return (
    <Wrapper>
      {location.pathname === '/' && (
        <Hero>
          <h2>Comienza a explorar 👋</h2>
        </Hero>
      )}
      {location.pathname !== '/' && (
        <SectionTitle>Alojamientos</SectionTitle>
      )}
      <FilterBar>
        <Input $minimal placeholder="Buscar por nombre o ubicación..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select $minimal value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="rating_desc">Más relevantes</option>
          <option value="price_asc">Precio: más bajo a más alto</option>
          <option value="price_desc">Precio: más alto a más bajo</option>
        </Select>
        <Button $variant="primary" onClick={fetch}>Buscar</Button>
      </FilterBar>
      {loading ? <p>Cargando…</p> : (
        <Grid>
          {results
            .filter((acc) => !query || (acc.title || '').toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => {
              const [field, order] = sortBy.split('_')
              if (order === 'asc') {
                return a[field] > b[field] ? 1 : -1
              }
              return a[field] < b[field] ? 1 : -1
            })
            .map((acc) => (
            <ServiceCard
              key={acc.id}
              image={(Array.isArray(acc.images) && acc.images.length > 0 ? acc.images[0].url : acc.image_url) || '/vite.svg'}
              title={acc.title}
              price={Number(acc.price) || 0}
              rating={acc.rating ?? 0}
              to={`/alojamientos/${acc.id}`}
              $tallMobile
            />
          ))}
        </Grid>
      )}
    </Wrapper>
  )
}
