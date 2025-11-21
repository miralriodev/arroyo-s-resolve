import styled from 'styled-components'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'

const Card = styled.article`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  display: grid;
`

const ImageWrap = styled.div`
  position: relative;
  overflow: hidden;
`

const Image = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`

const Status = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const Meta = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export default function BookingCard({ booking, contact, onShowContact, onHideContact, contactLoading }) {
  const statusMeta = {
    pending: { label: 'Pendiente', variant: 'warn' },
    confirmed: { label: 'Confirmada', variant: 'success' },
    rejected: { label: 'Rechazada', variant: 'danger' }
  }[booking.status] || { label: booking.status, variant: 'secondary' }

  const start = new Date(booking.start_date).toLocaleDateString()
  const end = new Date(booking.end_date).toLocaleDateString()
  const img = booking.accommodation?.image_url
  const title = booking.accommodation?.title || 'Alojamiento'
  const location = booking.accommodation?.location || ''
  const amount = Number(booking.amount)

  return (
    <Card aria-label={`Reserva ${title}`}>
      {img && (
        <ImageWrap>
          <Image src={img} alt={title} />
          <Status>
            <Badge $variant={statusMeta.variant} $compact>{statusMeta.label}</Badge>
          </Status>
        </ImageWrap>
      )}
      <Content>
        <Title>{title}</Title>
        <Meta>
          <span>{start} — {end} · {booking.guests} huésped(es)</span>
          <span>{location} · ${amount}</span>
          {contact && !contact.error && (
            <span>Hosted by {contact.host?.name ?? '-'}</span>
          )}
        </Meta>
      </Content>
      <Footer>
        {booking.status === 'confirmed' ? (
          contact ? (
            <Button $variant="outline" onClick={() => onHideContact(booking.id)}>Ocultar contacto</Button>
          ) : (
            <Button $variant="outline" onClick={() => onShowContact(booking.id)} disabled={contactLoading === booking.id}>
              {contactLoading === booking.id ? 'Cargando…' : 'Ver contacto'}
            </Button>
          )
        ) : (
          <span style={{ color: '#6b7280' }}>Confirmar para ver contacto</span>
        )}
        <div>
          {booking.payment_confirmed_by_host ? (
            <Badge $variant="success" $compact>Pagado</Badge>
          ) : (
            <Badge $variant="warn" $compact>Pendiente</Badge>
          )}
        </div>
      </Footer>
    </Card>
  )
}