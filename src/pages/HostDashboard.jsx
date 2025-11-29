import { BarChartIcon, CheckCircledIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { createAccommodation, setAvailability } from '../api/accommodations'
import { confirmBooking, getContact, listHostBookingsWithMeta, markPaid, rejectBooking } from '../api/bookings'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import FormMessage from '../components/atoms/FormMessage'
import Heading from '../components/atoms/Heading'
import IconCheck from '../components/atoms/IconCheck'
import IconMoney from '../components/atoms/IconMoney'
import IconX from '../components/atoms/IconX'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Paragraph from '../components/atoms/Paragraph'
import Select from '../components/atoms/Select'
import { Table, TableActions, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import Textarea from '../components/atoms/Textarea'
import Toolbar from '../components/atoms/Toolbar'
import { FieldLabel, FieldPill, FieldRow, RightIcon } from '../components/molecules/PillFields'
import { useAuth } from '../supabase/AuthContext'
import { supabase } from '../supabase/supabase.config.jsx'

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  &:hover { text-decoration: underline; text-underline-offset: 3px; }
`

const fadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`

const slideUp = keyframes`
  from { transform: translateY(12px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
`

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  animation: ${fadeIn} 120ms ease-out;
  z-index: 30;
`

const ModalSheet = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 520px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.md};
  animation: ${slideUp} 140ms ease-out;
  z-index: 31;
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
`

const DashboardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`

const StatCard = styled.div`
  display: grid;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: linear-gradient(180deg, #fff, #fafafa);
  padding: 16px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  transition: transform 120ms ease-out, box-shadow 120ms ease-out;
  &:hover { transform: translateY(-1px); box-shadow: ${({ theme }) => theme.shadow.md}; }
  &:focus-within { outline: 2px solid ${({ theme }) => theme.colors.focus}; outline-offset: 2px; }
  .icon { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin: 0 auto; color: ${({ theme }) => theme.colors.muted}; }
  h3 { font-size: 0.92rem; font-weight: 600; margin: 0; }
  .value { font-size: 1.5rem; font-weight: 700; }
`

export default function HostDashboard() {
  const { session, user } = useAuth()
  const token = session?.access_token
  const [form, setForm] = useState({ title: '', description: '', price: 0, location: '', image_files: [], property_type: '', amenities: '', rules: '', max_guests: 1, instant_book: false, address: '', category: 'city' })
  const [availability, setAvail] = useState({ accommodationId: '', date: '', capacity: 1 })
  const [status, setStatus] = useState(null)

  // Estado para reservas del anfitrión
  const [items, setItems] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)
  const [contacts, setContacts] = useState({}) // { [bookingId]: { host, guest } }
  const [contactLoading, setContactLoading] = useState(null) // bookingId en carga
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // { id, type }
  const [refreshTick, setRefreshTick] = useState(0)
  const [actionMessage, setActionMessage] = useState(null)
  const [sortBy, setSortBy] = useState('start_date')
  const [sortDir, setSortDir] = useState('asc')
  const [q, setQ] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [contactModal, setContactModal] = useState(null)
  const [paymentModal, setPaymentModal] = useState(null)

  const MobileCards = styled.div`
    display: none;
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      display: grid;
      gap: ${({ theme }) => theme.spacing(4)};
    }
  `
  const DesktopOnly = styled.div`
    display: block;
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      display: none;
    }
  `

  const toggleSort = (field) => {
    setSortBy(field)
    setSortDir(prev => (prev === 'asc' && field === sortBy ? 'desc' : (field === sortBy ? 'asc' : 'asc')))
  }

  const renderSort = (field) => {
    if (sortBy !== field) return ''
    return sortDir === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
  }

  const filteredItems = () => {
    return items.filter(b => {
      const text = q.trim().toLowerCase()
      const matchesText = text ? (
        (b.accommodation?.title || '').toLowerCase().includes(text) ||
        (b.user?.full_name || '').toLowerCase().includes(text)
      ) : true
      const startOk = dateStart ? (new Date(b.start_date) >= new Date(dateStart)) : true
      const endOk = dateEnd ? (new Date(b.end_date) <= new Date(dateEnd)) : true
      return matchesText && startOk && endOk
    })
  }

  const sortedItems = () => {
    const compare = (a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'status': {
          const order = { pending: 0, confirmed: 1, rejected: 2 }
          return (order[a.status] - order[b.status]) * dir
        }
        case 'accommodation': {
          const av = (a.accommodation?.title || '').toLowerCase()
          const bv = (b.accommodation?.title || '').toLowerCase()
          return av.localeCompare(bv) * dir
        }
        case 'start_date': {
          return (new Date(a.start_date) - new Date(b.start_date)) * dir
        }
        case 'guests': {
          return ((a.guests || 0) - (b.guests || 0)) * dir
        }
        case 'amount': {
          return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * dir
        }
        case 'user': {
          const av = (a.user?.full_name || '').toLowerCase()
          const bv = (b.user?.full_name || '').toLowerCase()
          return av.localeCompare(bv) * dir
        }
        default:
          return 0
      }
    }
    return [...filteredItems()].sort(compare)
  }

  useEffect(() => {
    const load = async () => {
      setLoadingBookings(true)
      setBookingsError(null)
      try {
        const params = { page, pageSize }
        if (statusFilter !== 'all') params.status = statusFilter
        const { items, total } = await listHostBookingsWithMeta(token, params)
        setItems(Array.isArray(items) ? items : [])
        setTotal(Number.isFinite(total) ? total : null)
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Error cargando reservas del anfitrión'
        setBookingsError(msg)
      } finally {
        setLoadingBookings(false)
      }
    }
    if (token) load()
  }, [token, statusFilter, page, pageSize, refreshTick])

  const loadContact = async (bookingId) => {
    setContactLoading(bookingId)
    try {
      const data = await getContact(token, bookingId)
      setContacts(prev => ({ ...prev, [bookingId]: data }))
      setContactModal(bookingId)
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo obtener contacto'
      setContacts(prev => ({ ...prev, [bookingId]: { error: msg } }))
    } finally {
      setContactLoading(null)
    }
  }

  const hideContact = (bookingId) => {
    setContactModal(null)
  }

  const createAcc = async () => {
    setStatus('Creando…')
    try {
      const urls = []
      for (const file of (form.image_files || [])) {
        const ext = file.name.split('.').pop()
        const key = `accommodations/${user?.id || 'anon'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('service-images').upload(key, file, { upsert: true })
        if (upErr) throw new Error(upErr.message || 'No se pudo subir la imagen')
        const { data } = supabase.storage.from('service-images').getPublicUrl(key)
        if (data?.publicUrl) urls.push(data.publicUrl)
      }
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        location: form.location,
        image_url: urls[0],
        images: urls,
        property_type: form.property_type,
        amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        max_guests: Number(form.max_guests),
        instant_book: !!form.instant_book,
        address: form.address,
      }
      const acc = await createAccommodation(token, payload)
      setStatus(`Creado: ${acc.id}`)
      setForm({ title: '', description: '', price: 0, location: '', image_files: [], property_type: '', amenities: '', rules: '', max_guests: 1, instant_book: false, address: '', category: 'city' })
    } catch (e) {
      setStatus(e?.message || 'Error creando alojamiento')
    }
  }

  const doConfirm = async (id) => {
    setActionLoading({ id, type: 'confirm' })
    try {
      await confirmBooking(token, id)
      setRefreshTick(t => t + 1)
      setActionMessage({ tone: 'success', text: 'Reserva confirmada' })
    } catch (e) {
      setBookingsError(e?.response?.data?.error || e?.message || 'Error confirmando reserva')
      setActionMessage({ tone: 'error', text: 'No se pudo confirmar la reserva' })
    } finally {
      setActionLoading(null)
    }
  }

  const doReject = async (id) => {
    setActionLoading({ id, type: 'reject' })
    try {
      await rejectBooking(token, id)
      setRefreshTick(t => t + 1)
      setActionMessage({ tone: 'warn', text: 'Reserva rechazada' })
    } catch (e) {
      setBookingsError(e?.response?.data?.error || e?.message || 'Error rechazando reserva')
      setActionMessage({ tone: 'error', text: 'No se pudo rechazar la reserva' })
    } finally {
      setActionLoading(null)
    }
  }

  const doMarkPaid = async (id) => {
    setActionLoading({ id, type: 'paid' })
    try {
      await markPaid(token, id)
      setRefreshTick(t => t + 1)
      setActionMessage({ tone: 'success', text: 'Pago marcado' })
    } catch (e) {
      setBookingsError(e?.response?.data?.error || e?.message || 'Error marcando pago')
      setActionMessage({ tone: 'error', text: 'No se pudo marcar pago' })
    } finally {
      setActionLoading(null)
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

  function exportHostCSV() {
    const rows = sortedItems()
    const cols = [
      { label: 'Estado', get: (r) => r.status },
      { label: 'Alojamiento', get: (r) => r.accommodation?.title || '' },
      { label: 'Inicio', get: (r) => String(r.start_date).slice(0,10) },
      { label: 'Fin', get: (r) => String(r.end_date).slice(0,10) },
      { label: 'Huéspedes', get: (r) => r.guests },
      { label: 'Monto', get: (r) => r.amount },
      { label: 'Huésped', get: (r) => r.user?.full_name || '' },
      { label: 'Pago', get: (r) => r.payment_confirmed_by_host ? 'Pagado' : 'Pendiente' },
    ]
    const header = cols.map(c => c.label).join(',')
    const body = rows.map(r => cols.map(c => {
      const v = c.get(r)
      const s = v == null ? '' : String(v).replace(/"/g, '""')
      return `"${s}"`
    }).join(',')).join('\n')
    const csv = header + '\n' + body
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reservas-host.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Container>
      <Heading as="h2" level={2}>Panel de Anfitrión</Heading>
      <Paragraph>Gestiona tus anuncios, disponibilidad y reservas.</Paragraph>
      <Card>
        <CardHeader>
          <CardTitle>Crear anuncio</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <Label>
              Título
              <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Label>
            <Label>
              Ubicación
              <Input placeholder="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Label>
            <Label>
              Categoría
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="city">Ciudad</option>
                <option value="beach">Playa</option>
                <option value="mountain">Montaña</option>
              </Select>
            </Label>
            <Label>
              Precio por noche
              <Input placeholder="Precio por noche" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Label>
            <Label>
              Tipo de propiedad
              <Input placeholder="Tipo de propiedad" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} />
            </Label>
            <Label>
              Servicios (csv)
              <Input placeholder="Servicios (csv)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
            </Label>
            <Label>
              Subir imagen
              <input type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, image_files: Array.from(e.target.files || []) })} />
              <small style={{ color: '#6b7280' }}>Seleccionadas: {form.image_files?.length || 0}</small>
              {form.image_files?.length > 0 && (
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', marginTop: 8 }}>
                  {form.image_files.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt={f.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  ))}
                </div>
              )}
            </Label>
            <Label>
              Descripción
              <Textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Label>
            <Label>
              Reglas
              <Textarea placeholder="Reglas" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
            </Label>
            <Label>
              Máx huéspedes
              <Input placeholder="Máx huéspedes" type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: e.target.value })} />
            </Label>
            <Label>
              <input type="checkbox" checked={form.instant_book} onChange={(e) => setForm({ ...form, instant_book: e.target.checked })} /> Reserva Inmediata
            </Label>
            <Label>
              Dirección
              <Input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Label>
          </div>
          <Toolbar>
            <Button onClick={createAcc}>Crear alojamiento</Button>
          </Toolbar>
        </CardContent>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <CardHeader>
          <CardTitle>Disponibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Toolbar>
            <Label>
              Alojamiento ID
              <Input placeholder="Alojamiento ID" value={availability.accommodationId} onChange={(e) => setAvail({ ...availability, accommodationId: e.target.value })} />
            </Label>
            <Label>
              Fecha
              <Input type="date" value={availability.date} onChange={(e) => setAvail({ ...availability, date: e.target.value })} />
            </Label>
            <Label>
              Capacidad
              <Input type="number" min={1} value={availability.capacity} onChange={(e) => setAvail({ ...availability, capacity: e.target.value })} />
            </Label>
            <Button onClick={setAccAvailability}>Guardar disponibilidad</Button>
          </Toolbar>
        </CardContent>
      </Card>

      {status && <FormMessage tone={status?.toLowerCase().includes('error') ? 'error' : 'success'}>{status}</FormMessage>}

      <Card style={{ marginTop: 32 }}>
        <CardHeader>
          <CardTitle>Reservas de mis alojamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardGrid>
            <StatCard aria-label="Total reservas">
              <div className="icon"><BarChartIcon /></div>
              <h3>Reservas</h3>
              <div className="value">{items.length}</div>
            </StatCard>
            <StatCard aria-label="Reservas pendientes">
              <div className="icon"><ClockIcon /></div>
              <h3>Pendientes</h3>
              <div className="value">{items.filter(b => b.status === 'pending').length}</div>
            </StatCard>
            <StatCard aria-label="Reservas confirmadas">
              <div className="icon"><CheckCircledIcon /></div>
              <h3>Confirmadas</h3>
              <div className="value">{items.filter(b => b.status === 'confirmed').length}</div>
            </StatCard>
            <StatCard aria-label="Reservas rechazadas">
              <div className="icon"><CrossCircledIcon /></div>
              <h3>Rechazadas</h3>
              <div className="value">{items.filter(b => b.status === 'rejected').length}</div>
            </StatCard>
            <StatCard aria-label="Ingresos confirmados">
              <div className="icon"><BarChartIcon /></div>
              <h3>Ingresos</h3>
              <div className="value">${items.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.amount || 0), 0)}</div>
            </StatCard>
          </DashboardGrid>
          <Toolbar style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <FieldPill>
              <FieldLabel>Estado</FieldLabel>
              <FieldRow>
                <Select $bare value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }}>
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="rejected">Rechazadas</option>
                </Select>
                <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
              </FieldRow>
            </FieldPill>
            <FieldPill>
              <FieldLabel>Buscar</FieldLabel>
              <Input $bare placeholder="Alojamiento o huésped" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
            </FieldPill>
            <FieldPill>
              <FieldLabel>Inicio</FieldLabel>
              <Input $bare type="date" value={dateStart} onChange={(e) => { setDateStart(e.target.value); setPage(1) }} />
            </FieldPill>
            <FieldPill>
              <FieldLabel>Fin</FieldLabel>
              <Input $bare type="date" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value); setPage(1) }} />
            </FieldPill>
            <FieldPill>
              <FieldLabel>Página</FieldLabel>
              <Input $bare type="number" min={1} value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value)))} />
            </FieldPill>
            <FieldPill>
              <FieldLabel>Tamaño</FieldLabel>
              <FieldRow>
                <Select $bare value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </Select>
                <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
              </FieldRow>
            </FieldPill>
            {Number.isFinite(total) && (
              <span style={{ alignSelf: 'center', color: '#666' }}>Total: {total}</span>
            )}
          </Toolbar>
      {loadingBookings ? (
        <p>Cargando reservas…</p>
      ) : bookingsError ? (
        <p style={{ color: '#b00020' }}>{bookingsError}</p>
      ) : items.length === 0 ? (
        <p>No tienes reservas aún.</p>
      ) : (
        <div>
          {actionMessage && (
            <FormMessage tone={actionMessage.tone === 'warn' ? 'muted' : actionMessage.tone}>{actionMessage.text}</FormMessage>
          )}
          <MobileCards>
            {sortedItems().map((b) => {
              const start = new Date(b.start_date).toLocaleDateString()
              const end = new Date(b.end_date).toLocaleDateString()
              return (
                <Card key={b.id} aria-label={`Reserva ${b.accommodation?.title || ''}`}>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{b.accommodation?.title}</strong>
                      <Badge $variant={b.status === 'confirmed' ? 'success' : (b.status === 'pending' ? 'warn' : 'danger')} $compact>
                        {b.status === 'confirmed' ? 'Confirmada' : (b.status === 'pending' ? 'Pendiente' : 'Rechazada')}
                      </Badge>
                    </div>
                    <div style={{ color: '#666' }}>{start} — {end} · {b.guests} huésped(es)</div>
                    <div style={{ color: '#666' }}>{b.accommodation?.location || ''} · ${Number(b.amount)}</div>
                    <div style={{ marginTop: 6 }}>
                      <Badge $variant={b.payment_confirmed_by_host ? 'success' : 'warn'} $compact>
                        {b.payment_confirmed_by_host ? 'Pagado' : 'Pago pendiente'}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {b.status === 'pending' && (
                        <>
                          <Button title="Confirma la reserva" onClick={() => doConfirm(b.id)} disabled={actionLoading?.id === b.id && actionLoading?.type === 'confirm'}>
                            {actionLoading?.id === b.id && actionLoading?.type === 'confirm' ? 'Confirmando…' : 'Confirmar'}
                          </Button>
                          <Button title="Rechaza la reserva" onClick={() => doReject(b.id)} disabled={actionLoading?.id === b.id && actionLoading?.type === 'reject'}>
                            {actionLoading?.id === b.id && actionLoading?.type === 'reject' ? 'Rechazando…' : 'Rechazar'}
                          </Button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <>
                          <Button title="Muestra datos de contacto" onClick={() => loadContact(b.id)} disabled={contactLoading === b.id}>
                            {contactLoading === b.id ? 'Cargando…' : 'Ver contacto'}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </MobileCards>
          <DesktopOnly>
          <Table>
            <TableHeader $sticky cols="120px 1fr 160px 120px 120px 180px 140px 220px">
              <TableCell><HeaderButton onClick={() => toggleSort('status')}>Estado {renderSort('status')}</HeaderButton></TableCell>
              <TableCell><HeaderButton onClick={() => toggleSort('accommodation')}>Alojamiento {renderSort('accommodation')}</HeaderButton></TableCell>
              <TableCell><HeaderButton onClick={() => toggleSort('start_date')}>Fechas {renderSort('start_date')}</HeaderButton></TableCell>
              <TableCell><HeaderButton onClick={() => toggleSort('guests')}>Huéspedes {renderSort('guests')}</HeaderButton></TableCell>
              <TableCell><HeaderButton onClick={() => toggleSort('amount')}>Monto {renderSort('amount')}</HeaderButton></TableCell>
              <TableCell><HeaderButton onClick={() => toggleSort('user')}>Huésped {renderSort('user')}</HeaderButton></TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableHeader>
            {sortedItems().map((b, idx) => {
            const start = new Date(b.start_date).toLocaleDateString()
            const end = new Date(b.end_date).toLocaleDateString()
            const contact = contacts[b.id]
            const statusMeta = {
              pending: { label: 'Pendiente', variant: 'warn' },
              confirmed: { label: 'Confirmada', variant: 'success' },
              rejected: { label: 'Rechazada', variant: 'danger' }
            }[b.status] || { label: b.status, variant: 'secondary' }
            return (
              <div key={b.id}>
                <TableRow $odd={idx % 2 === 1} cols="120px 1fr 160px 120px 120px 180px 140px 220px">
                  <TableCell>
                    <Badge $variant={statusMeta.variant} $compact>{statusMeta.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.accommodation?.title}
                    {b.accommodation?.location ? ` · ${b.accommodation.location}` : ''}
                  </TableCell>
                  <TableCell>{start} — {end}</TableCell>
                  <TableCell>{b.guests}</TableCell>
                  <TableCell>
                    ${Number(b.amount)}
                    {b.payment_confirmed_by_host ? (
                      <span style={{ marginLeft: 6 }}>
                        <Badge $variant="success" $compact>Pagado</Badge>
                      </span>
                    ) : (
                      <span style={{ marginLeft: 6 }}>
                        <Badge $variant="warn" $compact>Pendiente</Badge>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{b.user?.full_name ?? '-'}</TableCell>
                  <TableCell>
                    {b.status === 'confirmed' ? (
                      <Button title="Muestra datos de contacto" onClick={() => loadContact(b.id)} disabled={contactLoading === b.id}>
                        {contactLoading === b.id ? 'Cargando…' : 'Ver contacto'}
                      </Button>
                    ) : (
                      <span style={{ color: '#666' }}>Confirmar para ver contacto</span>
                    )}
                  </TableCell>
                  <TableActions>
                    {b.status === 'pending' && (
                      <>
                        <Button title="Confirma la reserva" onClick={() => doConfirm(b.id)} disabled={actionLoading?.id === b.id && actionLoading?.type === 'confirm'}>
                          <IconCheck /> {actionLoading?.id === b.id && actionLoading?.type === 'confirm' ? 'Confirmando…' : 'Confirmar'}
                        </Button>
                        <Button title="Rechaza la reserva" onClick={() => doReject(b.id)} disabled={actionLoading?.id === b.id && actionLoading?.type === 'reject'}>
                          <IconX /> {actionLoading?.id === b.id && actionLoading?.type === 'reject' ? 'Rechazando…' : 'Rechazar'}
                        </Button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <Button title="Confirmar pago" onClick={() => setPaymentModal(b)}>
                        <IconMoney /> Confirmar pago
                      </Button>
                    )}
                  </TableActions>
                </TableRow>
                {contact && contact.error && (
                  <div style={{ marginTop: 6, marginLeft: 8, color: '#b00020' }}>{contact.error}</div>
                )}
              </div>
            )
          })}
          </Table>
          </DesktopOnly>
          <Toolbar>
            <Button onClick={() => exportHostCSV()}>Exportar CSV</Button>
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
            <Button onClick={() => setPage(p => p + 1)} disabled={Number.isFinite(total) ? (page * pageSize >= total) : items.length < pageSize}>Siguiente</Button>
          </Toolbar>
        </div>
      )}
        </CardContent>
      </Card>

      {contactModal && (
        <>
          <ModalBackdrop onClick={() => setContactModal(null)} />
          <ModalSheet role="dialog" aria-modal="true">
            <Heading as="h3" level={3}>Contacto del huésped</Heading>
            {contacts[contactModal] ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div><strong>Nombre:</strong> {contacts[contactModal].guest?.name ?? '-'}</div>
                <div><strong>Teléfono:</strong> {contacts[contactModal].guest?.phone ?? '-'}</div>
                <div><strong>Email:</strong> {contacts[contactModal].guest?.email ?? '-'}</div>
              </div>
            ) : (
              <Paragraph>Cargando…</Paragraph>
            )}
            <Toolbar>
              <Button onClick={() => setContactModal(null)}>Cerrar</Button>
            </Toolbar>
          </ModalSheet>
        </>
      )}

      {paymentModal && (
        <>
          <ModalBackdrop onClick={() => setPaymentModal(null)} />
          <ModalSheet role="dialog" aria-modal="true">
            <Heading as="h3" level={3}>Confirmar pago</Heading>
            <Paragraph>Reserva #{paymentModal.id} · ${Number(paymentModal.amount)}</Paragraph>
            <Toolbar>
              <Button onClick={() => setPaymentModal(null)}>Cancelar</Button>
              <Button $variant="primary" onClick={async () => { await doMarkPaid(paymentModal.id); setPaymentModal(null) }}>Confirmar</Button>
            </Toolbar>
          </ModalSheet>
        </>
      )}
    </Container>
  )
}
  const ContactCard = styled.div`
    margin-top: 6px;
    padding: 8px;
    background: #fff;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.text};
  `
