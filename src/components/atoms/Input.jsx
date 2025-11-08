import styled from 'styled-components'

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: #fff;
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  ::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15); /* shadow-md ring style */
  }
`

export default Input