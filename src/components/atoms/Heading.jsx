import styled from 'styled-components'

const Heading = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors?.text || '#222'};
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.2px;
  font-size: ${({ level }) => (
    level === 1 ? '2rem' : level === 2 ? '1.5rem' : level === 3 ? '1.25rem' : '1rem'
  )};
`

Heading.defaultProps = {
  as: 'h1',
  level: 1,
}

export default Heading