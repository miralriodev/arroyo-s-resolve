import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireRole({ allowed = ['admin'], children }) {
  const { user, session, loading } = useAuth()

  if (loading) return <div>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />

  const meta = session?.user?.app_metadata || {}
  const userMeta = session?.user?.user_metadata || {}

  let roles = meta.roles || meta.role || userMeta.roles || userMeta.role || []
  if (typeof roles === 'string') roles = [roles]

  const isAllowed = roles?.some?.(r => allowed.includes(r))
  if (!isAllowed) return <Navigate to="/" replace />

  return children
}