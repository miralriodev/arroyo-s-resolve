import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.layout.gutter};
  max-width: ${({ theme }) => theme.layout.maxWidth};
`

export default Container