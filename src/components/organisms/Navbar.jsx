import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../supabase/AuthContext'
import useConnectivity from '../../hooks/useConnectivity'
import Badge from '../atoms/Badge'

const Bar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(3)};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing(3)};
  }
`

const Brand = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

const Nav = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  a {
    color: ${({ theme }) => theme.colors.text};
    &.active { color: ${({ theme }) => theme.colors.primary}; }
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing(3)};
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: ${({ theme }) => theme.spacing(2)};
  }
`

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: 0.9rem;
  button {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
  }
`

export function Navbar() {
  const online = useConnectivity()
  const { user, signOut } = useAuth()
  return (
    <Bar>
      <Brand>Arroyo Seco</Brand>
      <Nav>
        <NavLink to="/" end>Servicios</NavLink>
        <NavLink to="/reservas">Reservas</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </Nav>
      <UserArea>
        <Badge $variant={online ? 'success' : 'danger'}>
          {online ? 'Online' : 'Offline'}
        </Badge>
        {user ? (
          <>
            <span>{user.email}</span>
            <button onClick={signOut}>Salir</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Ingresar</NavLink>
            <NavLink to="/registro">Registrarse</NavLink>
          </>
        )}
      </UserArea>
    </Bar>
  )
}

export default Navbar