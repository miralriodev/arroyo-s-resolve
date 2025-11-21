import styled from 'styled-components'

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme, $size }) => $size === 'sm' ? `${theme.spacing(2)} ${theme.spacing(3)}` : $size === 'lg' ? `${theme.spacing(4)} ${theme.spacing(6)}` : `${theme.spacing(3)} ${theme.spacing(5)}`};
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease, border-color 150ms ease, color 150ms ease;
  ${({ theme, $variant, $minimal }) => {
    const v = $minimal ? 'outline' : ($variant || 'default')
    if (v === 'primary') {
      return `background: ${theme.colors.secondary}; color: #fff; border: 1px solid transparent; box-shadow: ${theme.shadow.sm};`
    }
    if (v === 'destructive') {
      return `background: ${theme.colors.danger}; color: #fff; border: 1px solid transparent; box-shadow: ${theme.shadow.sm};`
    }
    if (v === 'outline') {
      return `background: transparent; color: ${theme.colors.text}; border: 1px solid ${theme.colors.border}; box-shadow: none;`
    }
    if (v === 'ghost') {
      return `background: transparent; color: ${theme.colors.text}; border: 1px solid transparent; box-shadow: none;`
    }
    return `background: #fff; color: ${theme.colors.text}; border: 1px solid ${theme.colors.border}; box-shadow: none;`
  }}
  &:hover {
    ${({ theme, $variant, $minimal }) => {
      const v = $minimal ? 'outline' : ($variant || 'default')
      if (v === 'primary') return `background: ${theme.colors.secondaryDark}; box-shadow: ${theme.shadow.md};`
      if (v === 'destructive') return `opacity: 0.95; box-shadow: ${theme.shadow.md};`
      if (v === 'outline') return `background: ${theme.colors.surfaceAlt}; box-shadow: ${theme.shadow.sm};`
      if (v === 'ghost') return `background: ${theme.colors.surfaceAlt};`
      return `background: ${theme.colors.surface};`
    }}
  }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default Button