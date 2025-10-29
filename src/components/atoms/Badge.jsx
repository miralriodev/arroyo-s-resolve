import styled from 'styled-components'

const Badge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.85rem;
  background: ${({ theme, $variant }) => $variant === 'success' ? theme.colors.success : $variant === 'danger' ? theme.colors.danger : theme.colors.secondary};
  color: #fff;
`

export default Badge