import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { syncProfile as syncProfileRequest } from '../api/auth'
import { listMyBookingsWithMeta } from '../api/bookings'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import FormMessage from '../components/atoms/FormMessage'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import { Table, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import Textarea from '../components/atoms/Textarea'
import { useAuth } from '../supabase/AuthContext'
import { supabase } from '../supabase/supabase.config.jsx'

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

const MobileHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(4)};
  }
`

const LocationRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`

const AvatarCircle = styled.img`
  width: 174px;
  height: 174px;
  border-radius: 9999px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  justify-self: center;
`

const Greeting = styled.h2`
  text-align: center;
  font-weight: 500;
  span.primary { color: #4373de; }
`

const Tile = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: left;
`

const TileText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  strong { font-weight: 600; }
  small { color: #808080; }
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
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef(null)

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

  const onAvatarPick = () => {
    fileRef.current?.click()
  }

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data?.publicUrl
      if (!publicUrl) throw new Error('No se obtuvo URL pública')
      const updated = await syncProfileRequest(token, { avatar_url: publicUrl })
      setProfile(updated || { ...profile, avatar_url: publicUrl })
      setSaveMsg('Avatar actualizado')
    } catch (err) {
      setSaveMsg(err?.message || 'No se pudo subir el avatar')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
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
            <div style={{ display: 'grid', gap: 18, justifyItems: 'center', padding: '8px 0' }}>
              <AvatarCircle src={profile?.avatar_url || '/icons/icon-192.png'} alt="Avatar grande" onClick={onAvatarPick} style={{ cursor: 'pointer' }} />
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarChange} />
              <Greeting>
                <span className="primary">Hola,</span> {user?.user_metadata?.full_name || user?.email || 'Usuario'}
              </Greeting>
              <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
                <Tile onClick={() => {}} disabled>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                  <TileText>
                    <strong>{user?.user_metadata?.full_name || 'Nombre'}</strong>
                    <small>Edita tu nombre o apellido</small>
                  </TileText>
                </Tile>
                <Tile onClick={() => {}} disabled>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 7l-10 7L2 7"/></svg>
                  <TileText>
                    <strong>{user?.email || '-'}</strong>
                    <small>Actualiza tu correo electrónico</small>
                  </TileText>
                </Tile>
                <Tile onClick={() => {}} disabled>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <TileText>
                    <strong>Verifica tu cuenta</strong>
                    <small>Valida los datos de tu cuenta</small>
                  </TileText>
                </Tile>
                <Tile onClick={() => {}} disabled>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-9-9 18-2-8-7-1z"/></svg>
                  <TileText>
                    <strong>Actualiza tu contraseña</strong>
                    <small>Cambia la contraseña de tu cuenta</small>
                  </TileText>
                </Tile>
                <div style={{ textAlign: 'center' }}>
                  <Button onClick={onAvatarPick} disabled={avatarUploading}>{avatarUploading ? 'Subiendo…' : 'Cambiar foto'}</Button>
                </div>
              </div>
            </div>
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