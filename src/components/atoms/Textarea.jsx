import styled from 'styled-components'

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: #fff;
  width: 100%;
  min-height: 96px;
  resize: vertical;
`

export default Textarea