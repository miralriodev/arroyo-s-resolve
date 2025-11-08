import styled from 'styled-components'

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.18); }
  &:active { transform: translateY(1px); }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Button