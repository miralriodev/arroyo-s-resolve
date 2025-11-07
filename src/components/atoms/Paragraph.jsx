import styled from 'styled-components'

const Paragraph = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors?.mutedText || theme.colors?.text || '#444'};
  line-height: 1.7;
  letter-spacing: 0.1px;
`

export default Paragraph