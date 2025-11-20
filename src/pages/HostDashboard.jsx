import { useEffect, useState } from 'react'
import { useAuth } from '../supabase/AuthContext'
import { createAccommodation, setAvailability } from '../api/accommodations'
import { listHostBookingsWithMeta, getContact, confirmBooking, rejectBooking, markPaid } from '../api/bookings'
import Container from '../components/atoms/Container'
import Toolbar from '../components/atoms/Toolbar'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import Textarea from '../components/atoms/Textarea'
import Label from '../components/atoms/Label'
import Select from '../components/atoms/Select'
import { FieldPill, FieldLabel, FieldRow, RightIcon } from '../components/molecules/PillFields'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card'
import { Table, TableHeader, TableRow, TableCell, TableActions } from '../components/atoms/Table'
import Heading from '../components/atoms/Heading'
import Paragraph from '../components/atoms/Paragraph'
import FormMessage from '../components/atoms/FormMessage'
import IconCheck from '../components/atoms/IconCheck'
import IconX from '../components/atoms/IconX'
import IconMoney from '../components/atoms/IconMoney'
import Badge from '../components/atoms/Badge'

export default function HostDashboard() {
  const { session } = useAuth()
  const token = session?.access_token
  const [form, setForm] = useState({ title: '', description: '', price: 0, location: '', image_url: '', property_type: '', amenities: '', rules: '', max_guests: 1, instant_book: false, address: '' })
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
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo obtener contacto'
      setContacts(prev => ({ ...prev, [bookingId]: { error: msg } }))
    } finally {
      setContactLoading(null)
    }
  }

  const hideContact = (bookingId) => {
    setContacts(prev => {
      const next = { ...prev }
      delete next[bookingId]
      return next
    })
  }

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
              Foto (URL)
              <Input placeholder="Foto (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
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
          <Table>
            <TableHeader cols="120px 1fr 160px 120px 120px 180px 140px 220px">
              <TableCell>Estado</TableCell>
              <TableCell>Alojamiento</TableCell>
              <TableCell>Fechas</TableCell>
              <TableCell>Huéspedes</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Huésped</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableHeader>
            {items.map((b) => {
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
                <TableRow cols="120px 1fr 160px 120px 120px 180px 140px 220px">
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
                      contact ? (
                        <Button title="Oculta datos de contacto" onClick={() => hideContact(b.id)}>Ocultar contacto</Button>
                      ) : (
                        <Button title="Muestra datos de contacto" onClick={() => loadContact(b.id)} disabled={contactLoading === b.id}>
                          {contactLoading === b.id ? 'Cargando…' : 'Ver contacto'}
                        </Button>
                      )
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
                      <Button title="Marca como pagado" onClick={() => doMarkPaid(b.id)} disabled={actionLoading?.id === b.id && actionLoading?.type === 'paid'}>
                        <IconMoney /> {actionLoading?.id === b.id && actionLoading?.type === 'paid' ? 'Marcando…' : 'Marcar pagado'}
                      </Button>
                    )}
                  </TableActions>
                </TableRow>
                {contact && !contact.error && (
                  <div style={{ marginTop: 6, marginLeft: 8, color: '#222' }}>
                    <div style={{ fontWeight: 'bold' }}>Huésped</div>
                    <div>Nombre: {contact.guest?.name ?? '-'}</div>
                    <div>Teléfono: {contact.guest?.phone ?? '-'}</div>
                    <div>Email: {contact.guest?.email ?? '-'}</div>
                  </div>
                )}
                {contact && contact.error && (
                  <div style={{ marginTop: 6, marginLeft: 8, color: '#b00020' }}>{contact.error}</div>
                )}
              </div>
            )
          })}
          </Table>
          <Toolbar>
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
            <Button onClick={() => setPage(p => p + 1)} disabled={Number.isFinite(total) ? (page * pageSize >= total) : items.length < pageSize}>Siguiente</Button>
          </Toolbar>
        </div>
      )}
        </CardContent>
      </Card>
    </Container>
  )
}