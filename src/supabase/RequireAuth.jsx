import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}