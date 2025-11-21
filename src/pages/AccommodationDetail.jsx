import { CalendarIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getAccommodation, listAvailability } from '../api/accommodations'
import { requestBooking } from '../api/bookings'
import { listAccommodationReviews } from '../api/reviews'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/atoms/Card'
import Container from '../components/atoms/Container'
import FormMessage from '../components/atoms/FormMessage'
import Heading from '../components/atoms/Heading'
import Input from '../components/atoms/Input'
import { Table, TableCell, TableHeader, TableRow } from '../components/atoms/Table'
import { FieldLabel, FieldRow, PillCell, PillGroup, RightIcon } from '../components/molecules/PillFields'
import { useAuth } from '../supabase/AuthContext'

export default function AccommodationDetail() {
  const { id } = useParams()
  const { session } = useAuth()
  const [acc, setAcc] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ start_date: '', end_date: '', guests: 1 })
  const [loading, setLoading] = useState(true)
  const [bookingStatus, setBookingStatus] = useState(null)
  const [availability, setAvailability] = useState([])
  const [availStatus, setAvailStatus] = useState(null)

  const Image = styled.img`
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
  `

  const MetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.colors.muted};
  `

  const HostCard = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(4)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md};
    background: #fff;
  `

  const HostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
  `

  const HostAvatar = styled.img`
    width: 44px;
    height: 44px;
    border-radius: 9999px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
  `

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAccommodation(id)
        setAcc(data)
        const rev = await listAccommodationReviews(id)
        setReviews(rev)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailStatus(null)
      setAvailability([])
      if (!form.start_date || !form.end_date) return
      try {
        const data = await listAvailability(Number(id), { startDate: form.start_date, endDate: form.end_date })
        setAvailability(Array.isArray(data) ? data : [])
        setAvailStatus('ok')
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Error cargando disponibilidad'
        setAvailStatus(msg)
      }
    }
    fetchAvailability()
  }, [id, form.start_date, form.end_date])

  const book = async () => {
    setBookingStatus('loading')
    if (!form.start_date || !form.end_date) {
      setBookingStatus('Por favor completa ambas fechas')
      return
    }
    if (form.end_date < form.start_date) {
      setBookingStatus('La fecha de salida debe ser posterior a la de entrada')
      return
    }
    try {
      const payload = { accommodationId: Number(id), ...form }
      const token = session?.access_token
      const data = await requestBooking(token, payload)
      setBookingStatus(`Reserva ${data.status}`)
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Error al reservar'
      setBookingStatus(msg)
    }
  }

  if (loading) return <Container>Cargando…</Container>
  if (!acc) return <Container>No encontrado</Container>

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>{acc.title}</CardTitle>
          <CardDescription>
            <MetaRow>
              <span>{acc.location || '-'}</span>
              <span>· ${Number(acc.price) || 0}</span>
              <span>· Máx {acc.max_guests || 1} huéspedes</span>
              {acc.instant_book && (
                <span>
                  <Badge $variant="success" $compact>Reserva instantánea</Badge>
                </span>
              )}
            </MetaRow>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acc.image_url && (
            <Image src={acc.image_url} alt={acc.title} />
          )}
          {acc.description && (
            <p>{acc.description}</p>
          )}
          <MetaRow>
            <span>Tipo: {acc.property_type || '-'}</span>
            {Array.isArray(acc.amenities) && acc.amenities.length > 0 && (
              <span>Servicios: {acc.amenities.join(', ')}</span>
            )}
          </MetaRow>
        </CardContent>
        <CardFooter>
          <Heading as="h3" level={3}>Reservar</Heading>
        </CardFooter>
      </Card>

      <Card aria-label="Reserva">
        <CardContent>
          <PillGroup cols={3}>
            <PillCell>
              <FieldLabel>Entrada</FieldLabel>
              <FieldRow>
                <Input $bare type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <RightIcon aria-hidden="true"><CalendarIcon /></RightIcon>
              </FieldRow>
            </PillCell>
            <PillCell>
              <FieldLabel>Salida</FieldLabel>
              <FieldRow>
                <Input $bare type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                <RightIcon aria-hidden="true"><CalendarIcon /></RightIcon>
              </FieldRow>
            </PillCell>
            <PillCell>
              <FieldLabel>Huéspedes</FieldLabel>
              <FieldRow>
                <Input $bare type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
              </FieldRow>
            </PillCell>
          </PillGroup>
          {bookingStatus && <FormMessage tone={bookingStatus === 'loading' ? 'muted' : (bookingStatus?.toLowerCase().includes('error') ? 'error' : 'success')}>{bookingStatus === 'loading' ? 'Procesando…' : bookingStatus}</FormMessage>}
        </CardContent>
        <CardFooter>
          <Button $variant="primary" onClick={book} disabled={!form.start_date || !form.end_date}>Solicitar/Reservar</Button>
        </CardFooter>
      </Card>

      <Card aria-label="Disponibilidad">
        <CardHeader>
          <CardTitle>Disponibilidad diaria</CardTitle>
          {!form.start_date || !form.end_date ? (
            <CardDescription>Selecciona un rango de fechas para ver disponibilidad.</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {form.start_date && form.end_date && (
            availStatus && availStatus !== 'ok' ? (
              <FormMessage tone="error">{availStatus}</FormMessage>
            ) : availability.length === 0 ? (
              <FormMessage>No hay disponibilidad configurada para este rango.</FormMessage>
            ) : (
              <Table>
                <TableHeader cols="160px 1fr 1fr 1fr">
                  <TableCell>Fecha</TableCell>
                  <TableCell>Capacidad</TableCell>
                  <TableCell>Reservado</TableCell>
                  <TableCell>Disponible</TableCell>
                </TableHeader>
                {availability.map((a, idx) => {
                  const dateStr = new Date(a.date).toLocaleDateString()
                  const available = (a.capacity ?? 0) - (a.reserved ?? 0)
                  const enough = available >= (form.guests || 1)
                  return (
                    <div key={idx}>
                      <TableRow cols="160px 1fr 1fr 1fr">
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{a.capacity}</TableCell>
                        <TableCell>{a.reserved}</TableCell>
                        <TableCell>
                          {available} {enough ? (
                            <span style={{ marginLeft: 6 }}><Badge $variant="success" $compact>ok</Badge></span>
                          ) : (
                            <span style={{ marginLeft: 6 }}><Badge $variant="warn" $compact>insuficiente</Badge></span>
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

      <Card aria-label="Reseñas">
        <CardHeader>
          <CardTitle>Reseñas</CardTitle>
          <CardDescription>Opiniones de huéspedes y anfitriones.</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <FormMessage>Sin reseñas aún</FormMessage>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {reviews.map((r, idx) => (
                <div key={idx} style={{ display: 'grid', gap: 6 }}>
                  <div>
                    <Badge $variant="secondary" $compact>Huésped</Badge> {r.guest_rating ?? '-'} {r.guest_comment ?? ''}
                  </div>
                  <div>
                    <Badge $variant="secondary" $compact>Anfitrión</Badge> {r.host_rating ?? '-'} {r.host_comment ?? ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card aria-label="Anfitrión">
        <CardHeader>
          <CardTitle>Conoce a tu anfitrión</CardTitle>
          <CardDescription>Información del anfitrión para tu tranquilidad.</CardDescription>
        </CardHeader>
        <CardContent>
          {acc?.host ? (
            <HostCard>
              <HostHeader>
                <HostAvatar src={acc.host.avatar_url || '/icons/icon-192.png'} alt={acc.host.name || 'Anfitrión'} />
                <div>
                  <strong>{acc.host.name || 'Anfitrión'}</strong>
                  <div style={{ color: '#6b7280' }}>{acc.host.city || '-'}</div>
                </div>
              </HostHeader>
              <MetaRow>
                {acc.host.superhost && <Badge $variant="success" $compact>Superanfitrión</Badge>}
                {Number(acc.host.years_experience) > 0 && <span>{acc.host.years_experience} años de experiencia</span>}
                {Array.isArray(acc.host.languages) && acc.host.languages.length > 0 && <span>Idiomas: {acc.host.languages.join(', ')}</span>}
              </MetaRow>
              {acc.host.bio && <p>{acc.host.bio}</p>}
              <MetaRow>
                {Number(acc.host.response_rate) >= 0 && <span>Tasa de respuesta: {acc.host.response_rate}%</span>}
                {acc.host.response_time && <span>Tiempo de respuesta: {acc.host.response_time}</span>}
              </MetaRow>
            </HostCard>
          ) : (
            <FormMessage>El anfitrión aún no ha configurado su información. Puedes revisar su perfil y reseñas más abajo.</FormMessage>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}