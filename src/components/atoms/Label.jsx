import styled from 'styled-components'

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`

export default Label