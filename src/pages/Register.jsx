import { useState } from 'react'
import { useAuth } from '../supabase/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      await signUp(email, password)
      setInfo('Revisa tu correo para confirmar la cuenta')
      navigate('/login')
    } catch (err) {
      setError(err?.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Crear cuenta</h1>
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
        <button type="submit" disabled={loading}>{loading ? 'Registrando…' : 'Registrarse'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && <p style={{ color: 'green' }}>{info}</p>}
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}