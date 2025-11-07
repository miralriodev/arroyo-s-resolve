import styled from 'styled-components'

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: #fff;
  width: 100%;
`

export default Input