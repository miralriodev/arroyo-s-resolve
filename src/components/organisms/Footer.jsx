import styled from 'styled-components'

const Wrapper = styled.footer`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing(6)};
  background: ${({ theme }) => theme.colors.primaryDark};
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
`

export function Footer() {
  return (
    <Wrapper>
      © {new Date().getFullYear()} Arroyo Seco — PWA
    </Wrapper>
  )
}

export default Footer