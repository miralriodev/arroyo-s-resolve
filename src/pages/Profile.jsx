import { BarChartIcon, CheckCircledIcon, ClockIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { syncProfile as syncProfileRequest } from '../api/auth'
import { listAllBookingsWithMeta, listHostBookingsWithMeta, listMyBookingsWithMeta } from '../api/bookings'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import FormMessage from '../components/atoms/FormMessage'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import { Table, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import Textarea from '../components/atoms/Textarea'
import BookingCard from '../components/molecules/BookingCard'
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

const DashboardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-top: ${({ theme }) => theme.spacing(3)};
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

export default function Profile() {
  const { user, session } = useAuth()
  const token = session?.access_token
  const navigate = useNavigate()
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
  const [nameModal, setNameModal] = useState(false)
  const [phoneModal, setPhoneModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef(null)
  const [roleStats, setRoleStats] = useState(null)
  const [infoModal, setInfoModal] = useState(false)

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
        setNewName(p?.full_name || (user?.user_metadata?.full_name || ''))
        setNewPhone(p?.phone || '')
      } catch (_) {
        // Silenciar
      }
    }
    if (token) fetchProfile()
  }, [token])

  useEffect(() => {
    const loadRoleStats = async () => {
      if (!token) return
      const r = String(profile?.role || '').toLowerCase()
      if (r === 'host') {
        const { items } = await listHostBookingsWithMeta(token, { page: 1, pageSize: 50 })
        const pending = items.filter(b => b.status === 'pending').length
        const confirmed = items.filter(b => b.status === 'confirmed').length
        const rejected = items.filter(b => b.status === 'rejected').length
        const revenue = items.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.amount || 0), 0)
        setRoleStats({ scope: 'host', pending, confirmed, rejected, revenue })
      } else if (r === 'admin') {
        const { items } = await listAllBookingsWithMeta(token, { page: 1, pageSize: 50 })
        const pending = items.filter(b => b.status === 'pending').length
        const confirmed = items.filter(b => b.status === 'confirmed').length
        const rejected = items.filter(b => b.status === 'rejected').length
        const revenue = items.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.amount || 0), 0)
        setRoleStats({ scope: 'admin', pending, confirmed, rejected, revenue })
      } else {
        setRoleStats(null)
      }
    }
    loadRoleStats()
  }, [token, profile?.role])

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
                <Tile onClick={() => setNameModal(true)}>
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
                    <small>El email se guarda al crear la cuenta</small>
                  </TileText>
                </Tile>
                <Tile onClick={() => setPhoneModal(true)}>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.36-.36a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <TileText>
                    <strong>{profile?.phone || 'Teléfono'}</strong>
                    <small>Actualiza tu teléfono</small>
                  </TileText>
                </Tile>
                <Tile onClick={() => setInfoModal(true)}>
                  <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#4373de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M12 4h9"/><path d="M4 9h16"/><path d="M4 15h16"/></svg>
                  <TileText>
                    <strong>Actualiza tu información</strong>
                    <small>Edita tu perfil público</small>
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
              {roleStats && (
                <DashboardGrid>
                  <StatCard aria-label="Reservas pendientes">
                    <div className="icon"><ClockIcon /></div>
                    <h3>{roleStats.scope === 'admin' ? 'Pendientes' : 'Reservas pendientes'}</h3>
                    <div className="value">{roleStats.pending}</div>
                  </StatCard>
                  <StatCard aria-label="Reservas confirmadas">
                    <div className="icon"><CheckCircledIcon /></div>
                    <h3>{roleStats.scope === 'admin' ? 'Confirmadas' : 'Reservas confirmadas'}</h3>
                    <div className="value">{roleStats.confirmed}</div>
                  </StatCard>
                  <StatCard aria-label="Reservas rechazadas">
                    <div className="icon"><CrossCircledIcon /></div>
                    <h3>Rechazadas</h3>
                    <div className="value">{roleStats.rejected}</div>
                  </StatCard>
                  <StatCard aria-label="Ingresos estimados">
                    <div className="icon"><BarChartIcon /></div>
                    <h3>Ingresos estimados</h3>
                    <div className="value">${roleStats.revenue}</div>
                  </StatCard>
                </DashboardGrid>
              )}
              {roleStats && (
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  {roleStats.scope === 'host' && (
                    <>
                      <Button onClick={() => navigate('/host')}>Ir a reservas</Button>
                      <Button onClick={() => navigate('/host')}>Crear alojamiento</Button>
                    </>
                  )}
                  {roleStats.scope === 'admin' && (
                    <Button onClick={() => navigate('/admin')}>Panel de administración</Button>
                  )}
                </div>
              )}
              
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoGrid>
              <InfoItem>
                <strong>Nombre</strong>
                <span>{profile?.full_name || user?.user_metadata?.full_name || '-'}</span>
              </InfoItem>
              <InfoItem>
                <strong>Email</strong>
                <span>{user?.email || '-'}</span>
              </InfoItem>
              <InfoItem>
                <strong>Teléfono</strong>
                <span>{profile?.phone || '-'}</span>
              </InfoItem>
            </InfoGrid>
          </CardContent>
          
        </Card>

        {nameModal && (
          <>
            <ModalBackdrop onClick={() => setNameModal(false)} />
            <ModalSheet role="dialog" aria-modal="true" aria-labelledby="modal-name-title">
              <CardTitle id="modal-name-title">Actualizar nombre</CardTitle>
              <Label>Nombre
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </Label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => setNameModal(false)}>Cancelar</Button>
                <Button $variant="outline" onClick={async () => {
                  setSaving(true)
                  setSaveMsg('')
                  try {
                    const updated = await syncProfileRequest(token, { full_name: newName })
                    setProfile(prev => ({ ...(prev || {}), full_name: updated?.full_name || newName }))
                    setNameModal(false)
                    setSaveMsg('Nombre actualizado')
                  } catch (err) {
                    setSaveMsg(err?.message || 'No se pudo actualizar el nombre')
                  } finally {
                    setSaving(false)
                  }
                }}>Guardar</Button>
              </div>
            </ModalSheet>
          </>
        )}

        {phoneModal && (
          <>
            <ModalBackdrop onClick={() => setPhoneModal(false)} />
            <ModalSheet role="dialog" aria-modal="true" aria-labelledby="modal-phone-title">
              <CardTitle id="modal-phone-title">Actualizar teléfono</CardTitle>
              <Label>Teléfono
                <Input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+54 9 1234 5678" />
              </Label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => setPhoneModal(false)}>Cancelar</Button>
                <Button $variant="outline" onClick={async () => {
                  setSaving(true)
                  setSaveMsg('')
                  try {
                    const updated = await syncProfileRequest(token, { phone: newPhone || null })
                    setProfile(prev => ({ ...(prev || {}), phone: updated?.phone || newPhone || null }))
                    setPhoneModal(false)
                    setSaveMsg('Teléfono actualizado')
                  } catch (err) {
                    setSaveMsg(err?.message || 'No se pudo actualizar el teléfono')
                  } finally {
                    setSaving(false)
                  }
                }}>Guardar</Button>
              </div>
            </ModalSheet>
          </>
        )}

        {infoModal && (
          <>
            <ModalBackdrop onClick={() => setInfoModal(false)} />
            <ModalSheet role="dialog" aria-modal="true" aria-labelledby="modal-info-title">
              <CardTitle id="modal-info-title">Actualizar información</CardTitle>
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
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => setInfoModal(false)}>Cancelar</Button>
                <Button $variant="outline" onClick={async () => {
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
                    setInfoModal(false)
                  } catch (err) {
                    setSaveMsg(err?.message || 'No se pudo guardar')
                  } finally {
                    setSaving(false)
                  }
                }}>Guardar</Button>
              </div>
              {saveMsg && <FormMessage tone={saveMsg.includes('actualizado') ? 'success' : 'error'}>{saveMsg}</FormMessage>}
            </ModalSheet>
          </>
        )}

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
                <div>
                  <CardsList>
                    {items.map((b) => (
                      <BookingCard key={b.id} booking={b} showContactActions={false} />
                    ))}
                  </CardsList>
                  <DesktopOnly>
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
                  </DesktopOnly>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </Wrapper>
    </Container>
  )
}
