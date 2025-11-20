import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { syncProfile as syncProfileRequest } from '../api/auth'

export default function RequireRole({ allowed = ['admin'], children }) {
  const { user, session, loading } = useAuth()
  const [role, setRole] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id || !session?.access_token) {
        setRole(null)
        setChecking(false)
        return
      }
      try {
        // Llamar al backend con el token para obtener/sincronizar el perfil
        const profile = await syncProfileRequest(session.access_token, {})
        setRole(profile?.role ?? null)
      } catch (error) {
        console.error('RequireRole: error leyendo perfil/rol', error)
        setRole(null)
      }
      setChecking(false)
    }
    fetchRole()
  }, [user?.id, session?.access_token])

  if (loading || checking) return <div>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  const normalizedAllowed = (allowed || []).map((a) => String(a).toLowerCase())
  const normalizedRole = role ? String(role).toLowerCase() : ''
  const isAllowed = normalizedRole ? normalizedAllowed.includes(normalizedRole) : false
  if (!isAllowed) {
    const retry = async () => {
      // Reintentar lectura del rol por si hubo un problema momentáneo
      try {
        if (session?.access_token && user?.id) {
          setChecking(true)
          const profile = await syncProfileRequest(session.access_token, {})
          setRole(profile?.role ?? null)
        }
      } catch (error) {
        console.error('RequireRole: reintento fallido', error)
      } finally {
        setChecking(false)
      }
    }
    return (
      <div style={{ padding: 16 }}>
        <h3>Acceso restringido</h3>
        <p>Tu rol actual: <b>{normalizedRole || 'desconocido'}</b></p>
        <p>Roles permitidos aquí: {normalizedAllowed.join(', ')}</p>
        <button onClick={retry} disabled={checking}>{checking ? 'Reintentando…' : 'Reintentar lectura de rol'}</button>
      </div>
    )
  }

  return children
}