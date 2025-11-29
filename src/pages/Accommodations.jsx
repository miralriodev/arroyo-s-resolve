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
//

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Hero = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(5)};
  background: #fff;
  box-shadow: none;
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

const SectionTitle = styled.h2`
  padding-left: ${({ theme }) => theme.spacing(5)};
`

//

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
      <FiltersRowTop>
        <FieldPill>
          <FieldLabel>Ubicación</FieldLabel>
          <FieldRow>
            <Input $bare placeholder="Arroyo Seco, Qro., México" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </FieldRow>
        </FieldPill>
        <PillGroup cols={3}>
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
          <PillCell>
            <FieldLabel>Huéspedes</FieldLabel>
            <FieldRow>
              <Input $bare type="number" min={1} value={filters.guests} onChange={(e) => setFilters({ ...filters, guests: Number(e.target.value) })} />
            </FieldRow>
          </PillCell>
        </PillGroup>
      </FiltersRowTop>

      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button $variant="outline" onClick={fetch}>Buscar</Button>
      </div>
      {loading ? <p>Cargando…</p> : (
        <Grid>
          {results
            .filter((acc) => !query || (acc.title || '').toLowerCase().includes(query.toLowerCase()))
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
