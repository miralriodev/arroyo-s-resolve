import styled from 'styled-components'

const FormMessage = styled.small`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(2)};
  font-size: 0.85rem;
  color: ${({ tone = 'muted', theme }) => tone === 'error' ? theme.colors.danger : tone === 'success' ? theme.colors.success : theme.colors.muted};
`

export default FormMessage