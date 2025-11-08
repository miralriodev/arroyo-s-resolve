import styled from 'styled-components'

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: #fff;
  width: 100%;
  min-height: 96px;
  resize: vertical;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  ::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
  }
`

export default Textarea