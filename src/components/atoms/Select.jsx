import styled from 'styled-components'

const Select = styled.select`
  padding: ${({ theme, $bare }) => $bare ? `${theme.spacing(1)} 0` : theme.spacing(3)};
  border: ${({ theme, $minimal, $bare }) => $bare ? 'none' : `1px solid ${$minimal ? theme.colors.text : theme.colors.border}`};
  border-radius: ${({ theme, $bare }) => $bare ? 0 : theme.radius.sm};
  background: ${({ $bare }) => $bare ? 'transparent' : '#fff'};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  box-shadow: none;
  transition: border-color 120ms ease, background 120ms ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  &:hover { background: ${({ $bare, theme }) => $bare ? 'transparent' : theme.colors.surfaceAlt}; }
  &:focus {
    outline: none;
    border-color: ${({ theme, $minimal, $bare }) => $bare ? 'transparent' : ($minimal ? theme.colors.text : theme.colors.border)};
    box-shadow: ${({ $bare }) => $bare ? 'none' : '0 0 0 3px rgba(0,0,0,0.06)'};
  }
`

export default Select