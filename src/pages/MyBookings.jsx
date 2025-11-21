import { ChevronDownIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { getContact, listMyBookingsWithMeta } from '../api/bookings'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import Heading from '../components/atoms/Heading'
import Input from '../components/atoms/Input'
import Select from '../components/atoms/Select'
import { Table, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import Toolbar from '../components/atoms/Toolbar'
import { FieldLabel, FieldPill, FieldRow, RightIcon } from '../components/molecules/PillFields'
import styled from 'styled-components'
import BookingCard from '../components/molecules/BookingCard'
import { useAuth } from '../supabase/AuthContext'

export default function MyBookings() {
  const { session } = useAuth()
  const token = session?.access_token
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contacts, setContacts] = useState({}) // { [bookingId]: { host, guest } }
  const [contactLoading, setContactLoading] = useState(null) // bookingId en carga
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = { page, pageSize }
        if (statusFilter !== 'all') params.status = statusFilter
        const { items, total } = await listMyBookingsWithMeta(token, params)
        setItems(Array.isArray(items) ? items : [])
        setTotal(Number.isFinite(total) ? total : null)
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Error cargando reservas'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token, statusFilter, page, pageSize])

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

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>
  if (error) return <div style={{ padding: 16 }}>{error}</div>

  const CardsList = styled.div`
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

  const ContactCard = styled.div`
    margin-top: 6px;
    padding: 8px;
    background: #fff;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.sm};
    color: ${({ theme }) => theme.colors.text};
  `

  return (
    <Container>
      <Heading as="h2" level={2}>Mis reservas</Heading>
      
      <Card>
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
            <span style={{ alignSelf: 'center', color: '#6b7280' }}>Total: {total}</span>
          )}
        </Toolbar>
      {items.length === 0 ? (
        <p>No tienes reservas aún.</p>
      ) : (
        <div>
          <Heading as="h3" level={3}>Próximas reservas</Heading>
          <CardsList>
            {items.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                contact={contacts[b.id]}
                onShowContact={loadContact}
                onHideContact={hideContact}
                contactLoading={contactLoading}
              />
            ))}
          </CardsList>
          <DesktopOnly>
          <Table>
            <TableHeader cols="120px 1fr 160px 120px 120px 140px">
              <TableCell>Estado</TableCell>
              <TableCell>Alojamiento</TableCell>
              <TableCell>Fechas</TableCell>
              <TableCell>Huéspedes</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Contacto</TableCell>
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
                <TableRow cols="120px 1fr 160px 120px 120px 140px">
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
                  <TableCell>
                    {b.status === 'confirmed' ? (
                      contact ? (
                        <Button $variant="outline" title="Oculta datos de contacto" onClick={() => hideContact(b.id)}>Ocultar contacto</Button>
                      ) : (
                        <Button $variant="outline" title="Muestra datos de contacto" onClick={() => loadContact(b.id)} disabled={contactLoading === b.id}>
                          {contactLoading === b.id ? 'Cargando…' : 'Ver contacto'}
                        </Button>
                      )
                    ) : (
                      <span style={{ color: '#666' }}>Confirmar para ver contacto</span>
                    )}
                  </TableCell>
                </TableRow>
                {contact && !contact.error && (
                  <ContactCard>
                    <div style={{ fontWeight: 'bold' }}>Anfitrión</div>
                    <div>Nombre: {contact.host?.name ?? '-'}</div>
                    <div>Teléfono: {contact.host?.phone ?? '-'}</div>
                    <div>Email: {contact.host?.email ?? '-'}</div>
                  </ContactCard>
                )}
                {contact && contact.error && (
                  <div style={{ marginTop: 6, marginLeft: 8, color: '#b00020' }}>{contact.error}</div>
                )}
              </div>
            )
          })}
          </Table>
          </DesktopOnly>
          <Toolbar>
            <Button $variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
            <Button $variant="outline" onClick={() => setPage(p => p + 1)} disabled={Number.isFinite(total) ? (page * pageSize >= total) : items.length < pageSize}>Siguiente</Button>
          </Toolbar>
        </div>
      )}
        </CardContent>
      </Card>
    </Container>
  )
}