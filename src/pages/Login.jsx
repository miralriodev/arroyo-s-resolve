import { useState } from 'react'
import { useAuth } from '../supabase/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err?.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Accediendo…' : 'Entrar'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </div>
  )
}