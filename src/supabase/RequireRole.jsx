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
  const isAllowed = role ? allowed.includes(role) : false
  if (!isAllowed) return <Navigate to="/" replace />

  return children
}