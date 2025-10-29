import styled from 'styled-components'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

export default function Reservations() {
  return (
    <Wrapper>
      <h2>Reservas</h2>
      <p>Listado y estado de reservas (pendiente/confirmada/cancelada).</p>
    </Wrapper>
  )
}