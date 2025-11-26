import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styled, { ThemeProvider, keyframes } from 'styled-components'
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
  padding: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(1.5)};
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing(1)};
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
  const [legalOpen, setLegalOpen] = useState(false)

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

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('legalAccepted')
      if (!accepted) setLegalOpen(true)
    } catch (_) {}
  }, [])

  const fadeIn = keyframes`
    from { opacity: 0 }
    to { opacity: 1 }
  `
  const slideUp = keyframes`
    from { transform: translateY(12px); opacity: 0 }
    to { transform: translateY(0); opacity: 1 }
  `
  const Backdrop = styled.div`
    position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 999;
    animation: ${fadeIn} 120ms ease-out;
  `
  const Sheet = styled.div`
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 92%; max-width: 720px; background: #fff; border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md}; box-shadow: ${({ theme }) => theme.shadow.md}; z-index: 1000;
    animation: ${slideUp} 140ms ease-out; display: grid; gap: ${({ theme }) => theme.spacing(3)}; padding: ${({ theme }) => theme.spacing(4)};
  `
  const Actions = styled.div`
    display: flex; gap: 8px; justify-content: flex-end;
  `
  const Title = styled.h3`
    margin: 0; font-weight: 600;
  `
  const Text = styled.div`
    display: grid; gap: 8px; color: ${({ theme }) => theme.colors.text};
    max-height: 40vh; overflow: auto;
  `
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
        {legalOpen && (
          <>
            <Backdrop onClick={() => {}} />
            <Sheet role="dialog" aria-modal="true" aria-labelledby="legal-title">
              <Title id="legal-title">Aviso de Privacidad y Términos y Condiciones</Title>
              <Text>
                <p>Al utilizar este sitio, usted reconoce haber leído y aceptado el Aviso de Privacidad y los Términos y Condiciones aplicables en los Estados Unidos Mexicanos y, de forma específica, en Querétaro, Qro.</p>
                <p>El tratamiento de sus datos se realiza conforme a la LFPDPPP, con finalidades primarias de gestión de cuentas, reservas y cumplimiento legal, y secundarias de mejora y analítica.</p>
                <p>Para conocer el texto completo, consulte el <Link to="/privacidad" onClick={() => setLegalOpen(false)}>Aviso de Privacidad</Link>.</p>
              </Text>
              <Actions>
                <button onClick={() => setLegalOpen(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: '8px' }}>Cerrar</button>
                <button onClick={() => { try { localStorage.setItem('legalAccepted', 'yes') } catch (_) {}; setLegalOpen(false) }} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: '8px' }}>Aceptar y continuar</button>
              </Actions>
            </Sheet>
          </>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default AppShell
