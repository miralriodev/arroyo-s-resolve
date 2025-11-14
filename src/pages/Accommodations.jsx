import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchAccommodations } from '../api/accommodations'

export default function Accommodations() {
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
    <div style={{ padding: 16 }}>
      <h2>Alojamientos</h2>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
        <input placeholder="Ubicación" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <input type="number" min={1} value={filters.guests} onChange={(e) => setFilters({ ...filters, guests: Number(e.target.value) })} />
        <input placeholder="Mín Precio" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input placeholder="Máx Precio" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <input placeholder="Tipo de propiedad" value={filters.property_type} onChange={(e) => setFilters({ ...filters, property_type: e.target.value })} />
        <input placeholder="Servicios (csv)" value={filters.amenities} onChange={(e) => setFilters({ ...filters, amenities: e.target.value })} />
        <button onClick={fetch}>Buscar</button>
      </div>
      {loading ? <p>Cargando…</p> : (
        <ul style={{ marginTop: 16 }}>
          {results.map((acc) => (
            <li key={acc.id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
              <Link to={`/alojamientos/${acc.id}`}>{acc.title}</Link>
              <div>{acc.location} · ${Number(acc.price)}</div>
              {acc.image_url && <img src={acc.image_url} alt={acc.title} style={{ width: 200, height: 120, objectFit: 'cover' }} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}