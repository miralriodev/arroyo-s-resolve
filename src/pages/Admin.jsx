import { ChevronDownIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { adminUpdateBooking, adminUpdateBookingPayment, adminUpdateBookingStatus, listUsersWithMeta, updateUserRole } from '../api/admin'
import { syncProfile as syncProfileRequest } from '../api/auth'
import { listAllBookingsWithMeta } from '../api/bookings'
import { createApiClient } from '../api/client'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import Heading from '../components/atoms/Heading'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Paragraph from '../components/atoms/Paragraph'
import Select from '../components/atoms/Select'
import { Table, TableActions, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import Toolbar from '../components/atoms/Toolbar'
import AccommodationList from '../components/molecules/AccommodationList'
import { FieldLabel, FieldPill, FieldRow, RightIcon } from '../components/molecules/PillFields'
import { createAccommodation, deleteAccommodation, listAccommodations, updateAccommodation } from '../supabase/accommodations'
import { useAuth } from '../supabase/AuthContext.jsx'
import { uploadServiceImage } from '../supabase/storage'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const ErrorText = styled.p`
  color: #d32f2f;
`

export default function Admin() {
  const { user, session } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: 0, rating: 0, category: 'alojamiento', location: '', image_url: '', image_file: null })
  const [role, setRole] = useState(null)
  const [apiHealth, setApiHealth] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsError, setBookingsError] = useState('')
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(null)
  const [expandedBookingId, setExpandedBookingId] = useState(null)
  const [editBooking, setEditBooking] = useState({})
  const [bkSortBy, setBkSortBy] = useState('start_date')
  const [bkSortDir, setBkSortDir] = useState('asc')
  const [bkQ, setBkQ] = useState('')
  const [bkStart, setBkStart] = useState('')
  const [bkEnd, setBkEnd] = useState('')

  // Users admin panel
  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const [usersPageSize, setUsersPageSize] = useState(10)
  const [usersTotal, setUsersTotal] = useState(null)
  const [usersQ, setUsersQ] = useState('')
  const [usersRole, setUsersRole] = useState('all')
  const [userSortBy, setUserSortBy] = useState('created_at')
  const [userSortDir, setUserSortDir] = useState('desc')

  const HeaderButton = styled.button`
    appearance: none;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
  `

  const toggleBkSort = (field) => {
    setBkSortBy(field)
    setBkSortDir(prev => (bkSortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
  }
  const renderBkSort = (field) => {
    if (bkSortBy !== field) return ''
    return bkSortDir === 'asc' ? '↑' : '↓'
  }
  const sortedBookings = () => {
    const dir = bkSortDir === 'asc' ? 1 : -1
    const order = { pending: 0, confirmed: 1, rejected: 2 }
    const filtered = bookings.filter(b => {
      const text = bkQ.trim().toLowerCase()
      const matchesText = text ? (
        (b.accommodation?.title || '').toLowerCase().includes(text) ||
        (b.user?.full_name || b.user?.email || '').toLowerCase().includes(text)
      ) : true
      const startOk = bkStart ? (new Date(b.start_date) >= new Date(bkStart)) : true
      const endOk = bkEnd ? (new Date(b.end_date) <= new Date(bkEnd)) : true
      return matchesText && startOk && endOk
    })
    const cmp = (a, b) => {
      switch (bkSortBy) {
        case 'status': return (order[a.status] - order[b.status]) * dir
        case 'accommodation': {
          const av = (a.accommodation?.title || '').toLowerCase()
          const bv = (b.accommodation?.title || '').toLowerCase()
          return av.localeCompare(bv) * dir
        }
        case 'user': {
          const av = (a.user?.full_name || a.user?.email || '').toLowerCase()
          const bv = (b.user?.full_name || b.user?.email || '').toLowerCase()
          return av.localeCompare(bv) * dir
        }
        case 'start_date': return (new Date(a.start_date) - new Date(b.start_date)) * dir
        case 'amount': return ((Number(a.amount) || 0) - (Number(b.amount) || 0)) * dir
        default: return 0
      }
    }
    return [...filtered].sort(cmp)
  }

  const toggleUserSort = (field) => {
    setUserSortBy(field)
    setUserSortDir(prev => (userSortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
  }
  const renderUserSort = (field) => {
    if (userSortBy !== field) return ''
    return userSortDir === 'asc' ? '↑' : '↓'
  }
  const sortedUsers = () => {
    const dir = userSortDir === 'asc' ? 1 : -1
    const cmp = (a, b) => {
      switch (userSortBy) {
        case 'email': return ((a.user?.email || '').toLowerCase()).localeCompare((b.user?.email || '').toLowerCase()) * dir
        case 'full_name': return ((a.full_name || '').toLowerCase()).localeCompare((b.full_name || '').toLowerCase()) * dir
        case 'created_at': return ((new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime()) * dir
        default: return 0
      }
    }
    return [...users].sort(cmp)
  }

  function exportAdminBookingsCSV() {
    const rows = sortedBookings()
    const cols = [
      { label: 'Estado', get: (r) => r.status },
      { label: 'Alojamiento', get: (r) => r.accommodation?.title || '' },
      { label: 'Huésped', get: (r) => r.user?.full_name || r.user?.email || '' },
      { label: 'Inicio', get: (r) => String(r.start_date).slice(0,10) },
      { label: 'Fin', get: (r) => String(r.end_date).slice(0,10) },
      { label: 'Monto', get: (r) => r.amount },
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
    a.download = 'reservas-admin.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportAdminUsersCSV() {
    const rows = sortedUsers()
    const cols = [
      { label: 'Email', get: (r) => r.user?.email || '' },
      { label: 'Nombre', get: (r) => r.full_name || '' },
      { label: 'Creado', get: (r) => r.created_at ? String(r.created_at).slice(0,10) : '' },
      { label: 'Rol', get: (r) => r.role || '' },
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
    a.download = 'usuarios-admin.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const load = async () => {
    setLoading(true)
    try {
      const rows = await listAccommodations()
      setItems(rows || [])
      setError('')
    } catch (e) {
      setError(`Error cargando datos: ${e.message || ''}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (session?.access_token && user?.id) {
          const profile = await syncProfileRequest(session.access_token, {})
          if (active) setRole(profile?.role ?? null)
        } else if (active) {
          setRole(null)
        }
      } catch (_) {
        if (active) setRole(null)
      }
    })()
    return () => { active = false }
  }, [session?.access_token, user?.id])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const api = createApiClient(session?.access_token)
        const { data } = await api.get('/health')
        if (active) setApiHealth(data || null)
      } catch (e) {
        if (active) setApiHealth({ status: 'error', message: e?.message || 'No disponible' })
      }
    })()
    return () => { active = false }
  }, [session?.access_token])

  useEffect(() => {
    const loadBookings = async () => {
      setBookingsLoading(true)
      setBookingsError('')
      try {
        const params = { page, pageSize }
        if (statusFilter !== 'all') params.status = statusFilter
        const { items, total } = await listAllBookingsWithMeta(session?.access_token, params)
        setBookings(Array.isArray(items) ? items : [])
        setTotal(Number.isFinite(total) ? total : null)
      } catch (e) {
        setBookingsError(e?.response?.data?.error || e?.message || 'Error cargando reservas')
      } finally {
        setBookingsLoading(false)
      }
    }
    if (role === 'admin' && session?.access_token) loadBookings()
  }, [role, session?.access_token, statusFilter, page, pageSize])

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true)
      setUsersError('')
      try {
        const params = { page: usersPage, pageSize: usersPageSize }
        if (usersQ) params.q = usersQ
        if (usersRole !== 'all') params.role = usersRole
        const { items, total } = await listUsersWithMeta(session?.access_token, params)
        setUsers(Array.isArray(items) ? items : [])
        setUsersTotal(Number.isFinite(total) ? total : null)
      } catch (e) {
        setUsersError(e?.response?.data?.error || e?.message || 'Error cargando usuarios')
      } finally {
        setUsersLoading(false)
      }
    }
    if (role === 'admin' && session?.access_token) loadUsers()
  }, [role, session?.access_token, usersPage, usersPageSize, usersQ, usersRole])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      let payload = { ...form }
      // Si hay archivo, subir a Storage y usar la URL pública
      if (form.image_file) {
        const { publicUrl } = await uploadServiceImage(form.image_file, editing?.id || user?.id)
        payload.image_url = publicUrl
      }
      // No enviar el File al DB
      delete payload.image_file
      // Establecer host_id para cumplir políticas RLS por dueño/admin
      payload.host_id = editing?.host_id || user?.id || null

      if (editing) {
        await updateAccommodation(editing.id, payload)
      } else {
        const created = await createAccommodation(payload)
        
        // Si se crea sin id previo y había archivo, podríamos subir con id real; por simplicidad ya se subió con 'new/'.
      }
      setForm({ title: '', description: '', price: 0, rating: 0, category: 'alojamiento', location: '', image_url: '', image_file: null })
      setEditing(null)
      await load()
    } catch (e) {
      setError(`Error guardando datos: ${e.message || ''}`)
    }
  }

  const onEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title || '',
      description: item.description || '',
      price: item.price ?? 0,
      rating: item.rating ?? 0,
      category: item.category || 'alojamiento',
      location: item.location || '',
      image_url: item.image_url || '',
      image_file: null
    })
  }

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este alojamiento?')) return
    try {
      await deleteAccommodation(id)
      await load()
    } catch (e) {
      setError(`Error eliminando: ${e.message || ''}`)
    }
  }

  return (
    <Container>
      <Wrapper>
        <Heading as="h2" level={2}>Admin</Heading>
        <Paragraph>Panel administrativo: resumen y gestión básica.</Paragraph>

      <div>
        <h3>Resumen</h3>
        <div><strong>Usuario:</strong> {user?.email || '-'}</div>
        <div><strong>Rol:</strong> {role || '-'}</div>
        <div><strong>API:</strong> {apiHealth?.status || 'desconocido'} {apiHealth?.version ? `(v${apiHealth.version})` : ''}</div>
      </div>

     

      <div>
        <h3>Listado de alojamientos</h3>
        <AccommodationList items={items} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas (Admin)</CardTitle>
        </CardHeader>
        <CardContent>
        <Toolbar style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <FieldPill>
            <FieldLabel>Estado</FieldLabel>
            <FieldRow>
              <Select $bare value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="rejected">Rechazada</option>
              </Select>
              <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
            </FieldRow>
          </FieldPill>
          <FieldPill>
            <FieldLabel>Buscar</FieldLabel>
            <Input $bare placeholder="Alojamiento o huésped" value={bkQ} onChange={(e) => { setBkQ(e.target.value); setPage(1) }} />
          </FieldPill>
          <FieldPill>
            <FieldLabel>Inicio</FieldLabel>
            <Input $bare type="date" value={bkStart} onChange={(e) => { setBkStart(e.target.value); setPage(1) }} />
          </FieldPill>
          <FieldPill>
            <FieldLabel>Fin</FieldLabel>
            <Input $bare type="date" value={bkEnd} onChange={(e) => { setBkEnd(e.target.value); setPage(1) }} />
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
        </Toolbar>
        {bookingsLoading && <p>Cargando reservas…</p>}
        {bookingsError && <ErrorText>{bookingsError}</ErrorText>}
        {!bookingsLoading && !bookingsError && (
          bookings.length === 0 ? (
            <p>No hay reservas.</p>
          ) : (
            <div>
              <Table>
                <TableHeader $sticky cols="120px 1fr 160px 160px 140px 200px">
                  <TableCell><HeaderButton onClick={() => toggleBkSort('status')}>Estado {renderBkSort('status')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleBkSort('accommodation')}>Alojamiento {renderBkSort('accommodation')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleBkSort('user')}>Huésped {renderBkSort('user')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleBkSort('start_date')}>Fechas {renderBkSort('start_date')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleBkSort('amount')}>Pago {renderBkSort('amount')}</HeaderButton></TableCell>
                  <TableCell>Acciones</TableCell>
                </TableHeader>
                {sortedBookings().map((b, idx) => {
                  const start = new Date(b.start_date).toLocaleDateString()
                  const end = new Date(b.end_date).toLocaleDateString()
                  return (
                    <div key={b.id}>
                      <TableRow $odd={idx % 2 === 1} cols="120px 1fr 160px 160px 140px 200px">
                        <TableCell>
                        <FieldRow>
                          <Select defaultValue={b.status} onChange={(e) => setEditBooking(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), status: e.target.value } }))}>
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="rejected">Rechazada</option>
                          </Select>
                          <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
                        </FieldRow>
                        </TableCell>
                        <TableCell>
                         {b.accommodation?.title}
                         {b.accommodation?.location ? ` · ${b.accommodation.location}` : ''}
                        </TableCell>
                        <TableCell>{b.user?.full_name || b.user?.email || '-'}</TableCell>
                        <TableCell>{start} — {end}</TableCell>
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
                         <Label style={{ marginLeft: 8 }}>
                          <input type="checkbox" checked={Boolean(b.payment_confirmed_by_host)} onChange={async (e) => {
                            try {
                              await adminUpdateBookingPayment(session?.access_token, b.id, e.target.checked)
                              setBookings(prev => prev.map(x => x.id === b.id ? { ...x, payment_confirmed_by_host: e.target.checked } : x))
                            } catch (err) {
                              alert(err?.response?.data?.error || err?.message || 'Error al marcar pago')
                            }
                          }} />
                          {' '}Marcar pago
                         </Label>
                        </TableCell>
                        <TableActions>
                        <Button title="Guarda el estado de la reserva" onClick={async () => {
                          const newStatus = editBooking?.[b.id]?.status || b.status
                          try {
                            await adminUpdateBookingStatus(session?.access_token, b.id, newStatus)
                            setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: newStatus } : x))
                          } catch (err) {
                            alert(err?.response?.data?.error || err?.message || 'Error al cambiar estado')
                          }
                        }}>Guardar estado</Button>
                        <Button title="Ver u ocultar edición de la reserva" onClick={() => setExpandedBookingId(id => id === b.id ? null : b.id)}>
                          {expandedBookingId === b.id ? 'Ocultar' : 'Ver/Editar'}
                        </Button>
                        </TableActions>
                      </TableRow>
                    {expandedBookingId === b.id && (
                      <div style={{ marginTop: 8, padding: 8, background: '#fafafa', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <Label>
                            Inicio:
                            <Input as="input" type="date" defaultValue={String(b.start_date).slice(0,10)} onChange={(e) => setEditBooking(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), start_date: e.target.value } }))} />
                          </Label>
                          <Label>
                            Fin:
                            <Input as="input" type="date" defaultValue={String(b.end_date).slice(0,10)} onChange={(e) => setEditBooking(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), end_date: e.target.value } }))} />
                          </Label>
                          <Label>
                            Huéspedes:
                            <Input as="input" type="number" min={1} defaultValue={b.guests || 1} onChange={(e) => setEditBooking(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), guests: Number(e.target.value) } }))} />
                          </Label>
                          <Label>
                            Monto:
                            <Input as="input" type="number" min={0} step={0.01} defaultValue={Number(b.amount)} onChange={(e) => setEditBooking(prev => ({ ...prev, [b.id]: { ...(prev[b.id] || {}), amount: Number(e.target.value) } }))} />
                          </Label>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Button onClick={async () => {
                            try {
                              const payload = editBooking?.[b.id] || {}
                              await adminUpdateBooking(session?.access_token, b.id, payload)
                              setBookings(prev => prev.map(x => x.id === b.id ? { ...x, ...payload } : x))
                              alert('Reserva actualizada')
                            } catch (err) {
                              alert(err?.response?.data?.error || err?.message || 'Error al actualizar')
                            }
                          }}>Guardar cambios</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              </Table>
              <Toolbar>
                <Button onClick={() => exportAdminBookingsCSV()}>Exportar CSV</Button>
                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
                <Button onClick={() => setPage(p => p + 1)} disabled={Number.isFinite(total) ? (page * pageSize >= total) : bookings.length < pageSize}>Siguiente</Button>
              </Toolbar>
            </div>
          )
        )}
        </CardContent>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios (Admin)</CardTitle>
          </CardHeader>
          <CardContent>
        <Toolbar style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <FieldPill>
            <FieldLabel>Buscar</FieldLabel>
            <Input $bare placeholder="Nombre o email" value={usersQ} onChange={(e) => { setUsersQ(e.target.value); setUsersPage(1); }} />
          </FieldPill>
          <FieldPill>
            <FieldLabel>Rol</FieldLabel>
            <FieldRow>
              <Select $bare value={usersRole} onChange={(e) => { setUsersRole(e.target.value); setUsersPage(1); }}>
                <option value="all">Todos</option>
                <option value="visitor">Visitante</option>
                <option value="host">Anfitrión</option>
                <option value="admin">Admin</option>
              </Select>
              <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
            </FieldRow>
          </FieldPill>
        </Toolbar>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge $variant="secondary" $compact>Visitantes: {users.filter(u => u.role === 'visitor').length}</Badge>
          <Badge $variant="secondary" $compact>Anfitriones: {users.filter(u => u.role === 'host').length}</Badge>
          <Badge $variant="secondary" $compact>Admins: {users.filter(u => u.role === 'admin').length}</Badge>
          <Button onClick={() => exportAdminUsersCSV()}>Exportar CSV</Button>
        </div>
        {usersLoading && <p>Cargando usuarios…</p>}
        {usersError && <ErrorText>{usersError}</ErrorText>}
        {!usersLoading && !usersError && (
          users.length === 0 ? (
            <p>No hay usuarios.</p>
          ) : (
            <div>
              <Table>
                <TableHeader $sticky cols="220px 1fr 160px 140px">
                  <TableCell><HeaderButton onClick={() => toggleUserSort('email')}>Email {renderUserSort('email')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleUserSort('full_name')}>Nombre {renderUserSort('full_name')}</HeaderButton></TableCell>
                  <TableCell><HeaderButton onClick={() => toggleUserSort('created_at')}>Creado {renderUserSort('created_at')}</HeaderButton></TableCell>
                  <TableCell>Rol</TableCell>
                </TableHeader>
                {sortedUsers().map((u, idx) => (
                  <div key={u.id}>
                    <TableRow $odd={idx % 2 === 1} cols="220px 1fr 160px 140px">
                      <TableCell>{u.user?.email || '-'}</TableCell>
                      <TableCell>{u.full_name || '-'}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <FieldRow>
                        <Select defaultValue={u.role} onChange={async (e) => {
                          try {
                            const newRole = e.target.value
                            await updateUserRole(session?.access_token, u.id, newRole)
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
                          } catch (err) {
                            alert(err?.response?.data?.error || err?.message || 'Error al cambiar rol')
                          }
                        }}>
                          <option value="visitor">Visitante</option>
                          <option value="host">Anfitrión</option>
                          <option value="admin">Admin</option>
                        </Select>
                        <RightIcon aria-hidden="true"><ChevronDownIcon /></RightIcon>
                        </FieldRow>
                      </TableCell>
                    </TableRow>
                  </div>
                ))}
              </Table>
              <Toolbar>
                <Button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage <= 1}>Anterior</Button>
                <Button onClick={() => setUsersPage(p => p + 1)} disabled={Number.isFinite(usersTotal) ? (usersPage * usersPageSize >= usersTotal) : users.length < usersPageSize}>Siguiente</Button>
              </Toolbar>
            </div>
          )
        )}
          </CardContent>
        </Card>
      </div>
      </Wrapper>
    </Container>
  )
}