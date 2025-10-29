import styled, { ThemeProvider } from 'styled-components'
import { Outlet } from 'react-router-dom'
import { theme } from '../design-system/theme'
import { GlobalStyle } from '../design-system/GlobalStyle'
import Navbar from '../components/organisms/Navbar'
import Footer from '../components/organisms/Footer'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Main = styled.main`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
  flex: 1;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(3)};
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing(2)};
  }
`

export function AppShell() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Navbar />
        <Main>
          <Outlet />
        </Main>
        <Footer />
      </Container>
    </ThemeProvider>
  )
}

export default AppShell