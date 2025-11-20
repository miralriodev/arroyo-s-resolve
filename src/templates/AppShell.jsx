import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import Footer from '../components/organisms/Footer'
import Navbar from '../components/organisms/Navbar'
import { GlobalStyle } from '../design-system/GlobalStyle'
import { theme } from '../design-system/theme'

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

const BackBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  &:hover { background: ${({ theme }) => theme.colors.surface }; }
`

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const showBack = location.pathname !== '/'

  // Botón físico Atrás (Android - Capacitor):
  // - Si hay historial (incluye overlays que agregan pushState), retrocede
  // - Si no hay historial y estás en '/', sale de la app
  // - Si no hay historial y no estás en '/', navega atrás en router
  useEffect(() => {
    let removeListener
    ;(async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        const { App } = await import('@capacitor/app')
        const sub = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back()
          } else {
            if (location.pathname === '/') {
              App.exitApp()
            } else {
              navigate(-1)
            }
          }
        })
        removeListener = () => { try { sub.remove() } catch (_) {} }
      } catch (_) {
        // En web o si el plugin no está disponible
      }
    })()
    return () => { if (removeListener) removeListener() }
  }, [location.pathname, navigate])
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Navbar />
        <Main>
          {showBack && (
            <BackBar>
              <BackButton onClick={() => navigate(-1)} aria-label="Regresar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </BackButton>
            </BackBar>
          )}
          <Outlet />
        </Main>
        <Footer />
      </Container>
    </ThemeProvider>
  )
}

export default AppShell