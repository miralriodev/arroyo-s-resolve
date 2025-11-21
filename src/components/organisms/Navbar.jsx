import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { syncProfile as syncProfileRequest } from '../../api/auth'
import useConnectivity from '../../hooks/useConnectivity'
import { useAuth } from '../../supabase/AuthContext'
import Badge from '../atoms/Badge'

const Bar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: 'left center right';
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(17)}`};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing(3)};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(3)}`};
  }
`

const Brand = styled(NavLink)`
  grid-area: center;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  span { display: none; }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-area: left;
    justify-self: start;
    span { display: inline; color: #000; }
  }
`

const LogoImg = styled.img`
  width: 36px;
  height: 36px;
  object-fit: cover;
`

const Nav = styled.div`
  grid-area: center;
  display: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(7)};
    a {
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      &:hover { text-decoration: underline; text-underline-offset: 3px; }
      &.active { text-decoration: underline; text-underline-offset: 3px; }
    }
  }
`

const DrawerNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  a {
    color: ${({ theme }) => theme.colors.text};
    padding: 8px 12px;
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: 0.95rem;
    line-height: 1.2;
    &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
    &.active { color: ${({ theme }) => theme.colors.primary}; }
  }
`

const UserArea = styled.div`
  grid-area: right;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: auto;
  font-size: 0.9rem;
`

const MenuButton = styled.button`
  grid-area: left;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: none;
  &:hover { background: ${({ theme }) => theme.colors.surface }; }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 19;
`

const Drawer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: #fff;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.spacing(3)};
  display: grid;
  grid-template-rows: auto 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 20;
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
`

const Dropdown = styled.div`
  position: relative;
`

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 9999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: none;
  &:hover { background: ${({ theme }) => theme.colors.surface }; }
  span { display: none; }

  /* En escritorio mostramos también el nombre y formato anterior */
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: auto;
    height: auto;
    padding: 6px 10px;
    gap: ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.radius.sm};
    span { display: inline; }
  }
`

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
`

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  z-index: 20;
`

const MenuRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`

const MenuItem = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.surface }; }
`

export function Navbar() {
  const online = useConnectivity()
  const { user, session, signOut } = useAuth()
  const [role, setRole] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('/icons/icon-192.png')
  const [open, setOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const ref = useRef(null)
  const drawerRef = useRef(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (session?.access_token && user?.id) {
          const profile = await syncProfileRequest(session.access_token, {})
          if (active) {
            setRole(profile?.role ?? null)
            setProfileName(profile?.full_name || user.email || 'Usuario')
            if (profile?.avatar_url) setAvatarUrl(profile.avatar_url)
          }
        } else if (active) {
          setRole(null)
          setProfileName('Invitado')
          setAvatarUrl('/icons/icon-192.png')
        }
      } catch (_) {
        if (active) {
          setRole(null)
          setProfileName(user?.email || 'Usuario')
        }
        console.error('Navbar: no se pudo obtener rol', _)
      }
    })()
    return () => { active = false }
  }, [session?.access_token, user?.id])

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Cerrar sidebar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Integración con botón atrás (Android/navegador):
  // cuando se abre sidebar o menú de usuario, insertamos un estado en el historial
  // para que el botón atrás cierre la capa en lugar de navegar.
  useEffect(() => {
    if (sidebarOpen) {
      try { window.history.pushState({ sidebar: true }, '') } catch (_) {}
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (open) {
      try { window.history.pushState({ menu: true }, '') } catch (_) {}
    }
  }, [open])

  useEffect(() => {
    const onPop = () => {
      // Si alguna superposición está abierta, la cerramos y evitamos navegación adicional
      if (sidebarOpen) {
        setSidebarOpen(false)
        return
      }
      if (open) {
        setOpen(false)
        return
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [sidebarOpen, open])

  return (
    <Bar>
      <MenuButton aria-label="Abrir menú" onClick={() => setSidebarOpen(true)}>
        {/* ícono hamburguesa simple */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </MenuButton>

      <Brand to="/">
        <LogoImg src="/icons/cabin-logo.jpg" alt="Logo" />
        <span>CALI YOO</span>
      </Brand>

      <Nav>
        <NavLink to="/alojamientos" end>Alojamientos</NavLink>
        {user && <NavLink to="/mis-reservas">Mis reservas</NavLink>}
        {user && <NavLink to="/perfil">Perfil</NavLink>}
        {(['host','admin'].includes(String(role || '').toLowerCase())) && (
          <NavLink to="/host">Reservas</NavLink>
        )}
        {(String(role || '').toLowerCase() === 'admin') && (
          <NavLink to="/admin">Admin</NavLink>
        )}
      </Nav>

      {sidebarOpen && <Backdrop onClick={() => setSidebarOpen(false)} />}
      {sidebarOpen && (
        <Drawer ref={drawerRef} role="dialog" aria-label="Menú de navegación">
          <DrawerHeader>
            <span>Menú</span>
            <MenuButton aria-label="Cerrar" onClick={() => setSidebarOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </MenuButton>
          </DrawerHeader>
          <DrawerNav>
            <NavLink to="/alojamientos" end onClick={() => setSidebarOpen(false)}>Alojamientos</NavLink>
            {user && <NavLink to="/mis-reservas" onClick={() => setSidebarOpen(false)}>Mis reservas</NavLink>}
            {user && <NavLink to="/perfil" onClick={() => setSidebarOpen(false)}>Perfil</NavLink>}
            {(['host','admin'].includes(String(role || '').toLowerCase())) && (
              <NavLink to="/host" onClick={() => setSidebarOpen(false)}>Reservas</NavLink>
            )}
            {(String(role || '').toLowerCase() === 'admin') && (
              <NavLink to="/admin" onClick={() => setSidebarOpen(false)}>Admin</NavLink>
            )}
          </DrawerNav>
        </Drawer>
      )}
      <UserArea>
        <Dropdown ref={ref}>
          <Trigger onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}>
            <Avatar src={avatarUrl} alt="Avatar" />
            <span>{profileName || (user?.email || 'Invitado')}</span>
          </Trigger>
          {open && (
            <Menu role="menu">
              <MenuRow>
                <Badge $variant={online ? 'success' : 'danger'}>
                  {online ? 'Online' : 'Offline'}
                </Badge>
                <Badge $variant={'success'}>
                  Rol: {role || 'visitor'}
                </Badge>
              </MenuRow>
              {user ? (
                <>
                  <MenuItem onClick={signOut}>Salir</MenuItem>
                  <MenuItem onClick={() => { /* Configuración pendiente */ }}>Configuración</MenuItem>
                </>
              ) : (
                <>
                  <NavLink to="/login">Ingresar</NavLink>
                  <NavLink to="/registro">Registrarse</NavLink>
                </>
              )}
            </Menu>
          )}
        </Dropdown>
      </UserArea>
    </Bar>
  )
}

export default Navbar