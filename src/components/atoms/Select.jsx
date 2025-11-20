import styled from 'styled-components'

const Select = styled.select`
  padding: ${({ theme, $bare }) => $bare ? `${theme.spacing(1)} 0` : theme.spacing(3)};
  border: ${({ theme, $minimal, $bare }) => $bare ? 'none' : `1px solid ${$minimal ? theme.colors.text : theme.colors.border}`};
  border-radius: ${({ theme, $bare }) => $bare ? 0 : theme.radius.sm};
  background: ${({ $bare }) => $bare ? 'transparent' : '#fff'};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  box-shadow: ${({ theme, $minimal, $bare }) => $bare ? 'none' : ($minimal ? 'none' : theme.shadow.sm)};
  transition: box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  &:hover {
    box-shadow: ${({ theme, $minimal, $bare }) => $bare ? 'none' : ($minimal ? theme.shadow.sm : theme.shadow.md)};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme, $minimal, $bare }) => $bare ? 'transparent' : ($minimal ? theme.colors.text : theme.colors.secondary)};
    box-shadow: ${({ $minimal, $bare }) => $bare ? 'none' : ($minimal ? '0 0 0 3px rgba(33, 53, 71, 0.15)' : '0 0 0 3px rgba(25, 118, 210, 0.15)')};
  }
`

export default Select