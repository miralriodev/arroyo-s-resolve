import { CalendarIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../supabase/AuthContext'
import styled from 'styled-components'
import { searchAccommodations } from '../api/accommodations'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import { FieldLabel, FieldPill, FieldRow, PillCell, PillGroup, RightIcon } from '../components/molecules/PillFields'
import ServiceCard from '../components/molecules/ServiceCard'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Hero = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(5)};
  background: linear-gradient(180deg, #fff, ${({ theme }) => theme.colors.surface});
  box-shadow: ${({ theme }) => theme.shadow.sm};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const FiltersRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`

const FiltersRowTop = styled(FiltersRow)`
  grid-template-columns: minmax(280px, 420px) 1fr;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`

const FiltersRowBottom = styled(FiltersRow)`
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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
  const [filters, setFilters] = useState({ location: '', startDate: '', endDate: '', guests: 1, minPrice: '', maxPrice: '', property_type: '', amenities: '' })
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
          <h2>Hola{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''} 👋</h2>
          <p>Explora alojamientos y experiencias en Arroyo Seco. ¿Qué te gustaría descubrir hoy?</p>
        </Hero>
      )}
      <h2>Alojamientos</h2>
      <FiltersRowTop>
        <FieldPill>
          <FieldLabel>Ubicación</FieldLabel>
          <FieldRow>
            <Input $bare placeholder="Arroyo Seco, Qro., México" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </FieldRow>
        </FieldPill>
        <PillGroup>
          <PillCell>
            <FieldLabel>Llegada</FieldLabel>
            <FieldRow>
              <Input $bare type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              <RightIcon aria-hidden="true">
                <CalendarIcon />
              </RightIcon>
            </FieldRow>
          </PillCell>
          <PillCell>
            <FieldLabel>Salida</FieldLabel>
            <FieldRow>
              <Input $bare type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              <RightIcon aria-hidden="true">
                <CalendarIcon />
              </RightIcon>
            </FieldRow>
          </PillCell>
        </PillGroup>
      </FiltersRowTop>

      <FiltersRowBottom>
        <FieldPill>
          <FieldLabel>Mín Precio</FieldLabel>
          <FieldRow>
            <Input $bare type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          </FieldRow>
        </FieldPill>
        <FieldPill>
          <FieldLabel>Máx Precio</FieldLabel>
          <FieldRow>
            <Input $bare type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          </FieldRow>
        </FieldPill>
        <FieldPill>
          <FieldLabel>Tipo de propiedad</FieldLabel>
          <FieldRow>
            <Input $bare value={filters.property_type} onChange={(e) => setFilters({ ...filters, property_type: e.target.value })} />
          </FieldRow>
        </FieldPill>
        <FieldPill>
          <FieldLabel>Servicios (csv)</FieldLabel>
          <FieldRow>
            <Input $bare value={filters.amenities} onChange={(e) => setFilters({ ...filters, amenities: e.target.value })} />
          </FieldRow>
        </FieldPill>
      </FiltersRowBottom>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={fetch}>Buscar</Button>
      </div>
      {loading ? <p>Cargando…</p> : (
        <Grid>
          {results
            .filter((acc) => !query || (acc.title || '').toLowerCase().includes(query.toLowerCase()))
            .map((acc) => (
            <ServiceCard
              key={acc.id}
              image={acc.image_url || '/vite.svg'}
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