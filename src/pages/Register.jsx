import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../components/atoms/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/atoms/Card'
import FormMessage from '../components/atoms/FormMessage'
import IconCheck from '../components/atoms/IconCheck'
import IconX from '../components/atoms/IconX'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Select from '../components/atoms/Select'
import { useProfileSync } from '../hooks/useProfileSync'
import { useAuth } from '../supabase/AuthContext.jsx'

const Center = styled.main`
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing(4)};
  }
`

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Checklist = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.text};
`

const CheckItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ $ok, theme }) => ($ok ? theme.colors.success || '#2e7d32' : theme.colors.muted)};
`

export default function Register() {
  const { signUp } = useAuth()
  const { syncProfile } = useProfileSync()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('visitor')

  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const allValid = Object.values(checks).every(Boolean)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      await signUp(email, password, role)
      // Intentar sincronizar el rol elegido (si hay sesión disponible)
      try { await syncProfile({ role }) } catch (_) { /* silencioso */ }
      setInfo('Revisa tu correo para confirmar la cuenta')
      navigate('/login')
    } catch (err) {
      setError(err?.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>Ingresa tu correo y una contraseña segura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@ejemplo.com" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <Checklist aria-live="polite">
                <CheckItem $ok={checks.length}>{checks.length ? <IconCheck /> : <IconX />} 8+ caracteres</CheckItem>
                <CheckItem $ok={checks.lower}>{checks.lower ? <IconCheck /> : <IconX />} Minúscula (a–z)</CheckItem>
                <CheckItem $ok={checks.upper}>{checks.upper ? <IconCheck /> : <IconX />} Mayúscula (A–Z)</CheckItem>
                <CheckItem $ok={checks.number}>{checks.number ? <IconCheck /> : <IconX />} Número (0–9)</CheckItem>
                <CheckItem $ok={checks.special}>{checks.special ? <IconCheck /> : <IconX />} Carácter especial (!@#$…)</CheckItem>
              </Checklist>
              {!allValid && (
                <small style={{ color: '#666' }}>
                  Falta: {[
                    !checks.length && '8+ caracteres',
                    !checks.lower && 'minúscula',
                    !checks.upper && 'mayúscula',
                    !checks.number && 'número',
                    !checks.special && 'carácter especial',
                  ].filter(Boolean).join(', ')}
                </small>
              )}
            </div>
            <div>
              <Label htmlFor="role">Tipo de cuenta</Label>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="visitor">Huésped (por defecto)</option>
                <option value="host">Anfitrión (host)</option>
              </Select>
              <small style={{ color: '#555' }}>Las cuentas se crean por defecto como huésped.</small>
            </div>
            <Button type="submit" disabled={loading || !allValid}>{loading ? 'Registrando…' : 'Registrarse'}</Button>
            {error && <FormMessage tone="error">{error}</FormMessage>}
            {info && <FormMessage tone="success">{info}</FormMessage>}
          </Form>
        </CardContent>
        <CardFooter>
          <small>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </small>
          <span />
        </CardFooter>
      </Card>
    </Center>
  )
}
