import styled from 'styled-components'

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

export default function Profile() {
  return (
    <Wrapper>
      <h2>Perfil</h2>
      <p>Datos de usuario y preferencias.</p>
    </Wrapper>
  )
}