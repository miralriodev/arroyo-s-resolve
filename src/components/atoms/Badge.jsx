import styled from 'styled-components'

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme, $compact }) => $compact ? theme.spacing(1) : theme.spacing(2)};
  padding: ${({ theme, $compact }) => $compact ? `${theme.spacing(1)} ${theme.spacing(2)}` : `${theme.spacing(2)} ${theme.spacing(3)}`};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ $compact }) => $compact ? '0.8rem' : '0.85rem'};
  line-height: 1;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &::before {
    content: '';
    display: inline-block;
    width: ${({ $compact }) => $compact ? '7px' : '8px'};
    height: ${({ $compact }) => $compact ? '7px' : '8px'};
    border-radius: 50%;
    background: ${({ theme, $variant }) =>
      $variant === 'success'
        ? theme.colors.success
        : $variant === 'danger'
        ? theme.colors.danger
        : $variant === 'warn'
        ? theme.colors.warn
        : theme.colors.secondary};
  }
  /* Mantener texto visible también en mobile */
`

export default Badge
