import styled from 'styled-components'

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme, $minimal }) => $minimal ? theme.colors.text : 'transparent'};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme, $minimal }) => $minimal ? '#fff' : theme.colors.primary};
  color: ${({ theme, $minimal }) => $minimal ? theme.colors.text : '#fff'};
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease, border-color 150ms ease;
  box-shadow: ${({ theme, $minimal }) => $minimal ? 'none' : theme.shadow.sm};
  &:hover {
    background: ${({ theme, $minimal }) => $minimal ? theme.colors.surface : theme.colors.primaryDark};
    box-shadow: ${({ theme, $minimal }) => $minimal ? theme.shadow.sm : theme.shadow.md};
  }
  &:focus { outline: none; box-shadow: ${({ $minimal }) => $minimal ? '0 0 0 3px rgba(33, 53, 71, 0.15)' : '0 0 0 3px rgba(46, 125, 50, 0.18)'}; }
  &:active { transform: translateY(1px); }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Button