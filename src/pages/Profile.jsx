import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../supabase/AuthContext'
import { listMyBookingsWithMeta } from '../api/bookings'
import { syncProfile as syncProfileRequest } from '../api/auth'
import Container from '../components/atoms/Container'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/atoms/Card'
import Input from '../components/atoms/Input'
import Textarea from '../components/atoms/Textarea'
import Label from '../components/atoms/Label'
import Button from '../components/atoms/Button'
import FormMessage from '../components/atoms/FormMessage'
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
  const [edit, setEdit] = useState({
    host_title: '',
    host_bio: '',
    languages: '',
    years_experience: '',
    response_rate: '',
    response_time: '',
    superhost: false,
    city: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

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
        setEdit({
          host_title: p?.host_title || '',
          host_bio: p?.host_bio || '',
          languages: Array.isArray(p?.languages) ? p.languages.join(', ') : (p?.languages || ''),
          years_experience: p?.years_experience ?? '',
          response_rate: p?.response_rate ?? '',
          response_time: p?.response_time || '',
          superhost: Boolean(p?.superhost),
          city: p?.city || ''
        })
      } catch (_) {
        // Silenciar
      }
    }
    if (token) fetchProfile()
  }, [token])

  const onSave = async (e) => {
    e?.preventDefault?.()
    setSaving(true)
    setSaveMsg('')
    try {
      const payload = {
        host_title: edit.host_title,
        host_bio: edit.host_bio,
        languages: edit.languages.split(',').map(s => s.trim()).filter(Boolean),
        years_experience: Number(edit.years_experience) || 0,
        response_rate: Number(edit.response_rate) || 0,
        response_time: edit.response_time,
        superhost: Boolean(edit.superhost),
        city: edit.city
      }
      const updated = await syncProfileRequest(token, payload)
      setProfile(updated || payload)
      setSaveMsg('Perfil actualizado')
    } catch (err) {
      setSaveMsg(err?.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

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
          <CardFooter>
            <form onSubmit={onSave} style={{ width: '100%' }}>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <Label>Descripción breve (título)
                  <Input value={edit.host_title} onChange={(e) => setEdit({ ...edit, host_title: e.target.value })} />
                </Label>
                <Label>Ciudad
                  <Input value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
                </Label>
                <Label>Idiomas (csv)
                  <Input value={edit.languages} onChange={(e) => setEdit({ ...edit, languages: e.target.value })} />
                </Label>
                <Label>Años de experiencia
                  <Input type="number" min={0} value={edit.years_experience} onChange={(e) => setEdit({ ...edit, years_experience: e.target.value })} />
                </Label>
                <Label>Tasa de respuesta (%)
                  <Input type="number" min={0} max={100} value={edit.response_rate} onChange={(e) => setEdit({ ...edit, response_rate: e.target.value })} />
                </Label>
                <Label>Tiempo de respuesta aproximado
                  <Input value={edit.response_time} onChange={(e) => setEdit({ ...edit, response_time: e.target.value })} placeholder="~1 hora" />
                </Label>
                <Label>Superanfitrión
                  <input type="checkbox" checked={edit.superhost} onChange={(e) => setEdit({ ...edit, superhost: e.target.checked })} />
                </Label>
              </div>
              <Label>Biografía
                <Textarea value={edit.host_bio} onChange={(e) => setEdit({ ...edit, host_bio: e.target.value })} />
              </Label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button $variant="primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
              </div>
              {saveMsg && <FormMessage tone={saveMsg.includes('actualizado') ? 'success' : 'error'}>{saveMsg}</FormMessage>}
            </form>
          </CardFooter>
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