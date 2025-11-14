import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { supabase } from './supabase.config.jsx'

export default function RequireRole({ allowed = ['admin'], children }) {
  const { user, loading } = useAuth()
  const [role, setRole] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) {
        setRole(null)
        setChecking(false)
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (error) {
        // Si falla, tratamos como no autorizado
        console.error('RequireRole: error leyendo perfil/rol', error)
        setRole(null)
      } else {
        setRole(data?.role ?? null)
      }
      setChecking(false)
    }
    fetchRole()
  }, [user?.id])

  if (loading || checking) return <div>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  const normalizedAllowed = (allowed || []).map((a) => String(a).toLowerCase())
  const normalizedRole = role ? String(role).toLowerCase() : ''
  const isAllowed = normalizedRole ? normalizedAllowed.includes(normalizedRole) : false
  if (!isAllowed) return <Navigate to="/" replace />

  return children
}