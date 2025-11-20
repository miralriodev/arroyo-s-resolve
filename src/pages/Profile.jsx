import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../supabase/AuthContext'
import { listMyBookingsWithMeta } from '../api/bookings'
import { syncProfile as syncProfileRequest } from '../api/auth'
import Container from '../components/atoms/Container'
import { Card, CardHeader, CardTitle, CardContent } from '../components/atoms/Card'
import { Table, TableHeader, TableRow, TableCell } from '../components/atoms/Table'
import Badge from '../components/atoms/Badge'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const InfoGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export default function Profile() {
  const { user, session } = useAuth()
  const token = session?.access_token
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { items } = await listMyBookingsWithMeta(token, { page: 1, pageSize: 20 })
        setItems(Array.isArray(items) ? items : [])
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Error cargando historial'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await syncProfileRequest(token, {})
        setProfile(p || null)
      } catch (_) {
        // Silenciar
      }
    }
    if (token) fetchProfile()
  }, [token])

  return (
    <Container>
      <Wrapper>
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoGrid>
              <InfoItem>
                <strong>Email</strong>
                <span>{user?.email || '-'}</span>
              </InfoItem>
              <InfoItem>
                <strong>Nombre</strong>
                <span>{user?.user_metadata?.full_name || '-'}</span>
              </InfoItem>
              <InfoItem>
                <strong>Rol</strong>
                <span>{profile?.role || 'visitor'}</span>
              </InfoItem>
              <InfoItem>
                <strong>Registrado</strong>
                <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span>
              </InfoItem>
            </InfoGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Cargando historial…</p>}
            {error && <p style={{ color: '#b00020' }}>{error}</p>}
            {!loading && !error && (
              items.length === 0 ? (
                <p>No tienes reservas aún.</p>
              ) : (
                <Table>
                  <TableHeader cols="120px 1fr 160px 140px">
                    <TableCell>Estado</TableCell>
                    <TableCell>Alojamiento</TableCell>
                    <TableCell>Fechas</TableCell>
                    <TableCell>Pago</TableCell>
                  </TableHeader>
                  {items.map((b) => {
                    const start = new Date(b.start_date).toLocaleDateString()
                    const end = new Date(b.end_date).toLocaleDateString()
                    const statusMeta = {
                      pending: { label: 'Pendiente', variant: 'warn' },
                      confirmed: { label: 'Confirmada', variant: 'success' },
                      rejected: { label: 'Rechazada', variant: 'danger' }
                    }[b.status] || { label: b.status, variant: 'secondary' }
                    return (
                      <div key={b.id}>
                        <TableRow cols="120px 1fr 160px 140px">
                          <TableCell>
                            <Badge $variant={statusMeta.variant} $compact>{statusMeta.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {b.accommodation?.title}
                            {b.accommodation?.location ? ` · ${b.accommodation.location}` : ''}
                          </TableCell>
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
                          </TableCell>
                        </TableRow>
                      </div>
                    )
                  })}
                </Table>
              )
            )}
          </CardContent>
        </Card>
      </Wrapper>
    </Container>
  )
}