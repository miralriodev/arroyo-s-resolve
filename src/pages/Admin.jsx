import styled from 'styled-components'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

export default function Admin() {
  return (
    <Wrapper>
      <h2>Admin</h2>
      <p>Gestión de usuarios, servicios y reseñas.</p>
    </Wrapper>
  )
}