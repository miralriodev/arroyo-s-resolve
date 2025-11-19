import { useState } from 'react'
import { useAuth } from '../supabase/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { deleteAccount } from '../api/auth'

export default function DeleteAccount() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleDelete = async () => {
    setError('')
    setLoading(true)
    try {
      const token = session?.access_token
      if (!token) throw new Error('No autenticado')
      await deleteAccount(token)
      setDone(true)
      await signOut()
    } catch (e) {
      setError(e?.message || 'No se pudo eliminar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 640, margin: '24px auto' }}>
        <h2>Cuenta eliminada</h2>
        <p>Tu cuenta ha sido eliminada correctamente. Gracias por usar la plataforma.</p>
      </div>
    )
  }

  const renderLoggedOut = () => (
    <div style={{ maxWidth: 640, margin: '24px auto' }}>
      <h2>Eliminar mi cuenta</h2>
      <p>Para eliminar tu cuenta necesitas iniciar sesión.</p>
      <button
        onClick={() => navigate('/login?redirect=/privacidad/eliminar-cuenta')}
        style={{ padding: '8px 16px' }}
      >
        Iniciar sesión
      </button>
    </div>
  )

  const renderLoggedIn = () => (
    <div style={{ maxWidth: 640, margin: '24px auto' }}>
      <h2>Eliminar mi cuenta</h2>
      <p>
        Esta acción es permanente. Se borrará tu usuario y se eliminarán o anonimizarán tus datos
        asociados según nuestra política de retención.
      </p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <button onClick={handleDelete} disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? 'Eliminando…' : 'Eliminar mi cuenta'}
      </button>
    </div>
  )

  return session ? renderLoggedIn() : renderLoggedOut()
}