import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../supabase/AuthContext.jsx'
import Button from '../atoms/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../atoms/Card'
import FormMessage from '../atoms/FormMessage'
import Input from '../atoms/Input'
import Label from '../atoms/Label'

const Center = styled.main`
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing(5)};
`

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

export default function LoginForm() {
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resetInfo, setResetInfo] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResetInfo(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirect)
    } catch (err) {
      setError(err?.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const onResetPassword = async () => {
    setError(null)
    setResetInfo(null)
    try {
      if (!email) throw new Error('Ingresa tu email para recuperar contraseña')
      await resetPassword(email)
      setResetInfo('Te enviamos un correo para restablecer tu contraseña')
    } catch (err) {
      setError(err?.message ?? 'No se pudo enviar el correo de recuperación')
    }
  }

  return (
    <Center>
      <Card aria-label="Login">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accede para gestionar tus reservas y servicios.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} noValidate>
          <CardContent>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" required />
            </Field>
            <Field>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>
            {error && <FormMessage tone="error">{error}</FormMessage>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Accediendo…' : 'Entrar'}</Button>
            <FormMessage>
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </FormMessage>
            <Button type="button" $minimal onClick={onResetPassword}>Recuperar contraseña</Button>
            {resetInfo && <FormMessage tone="success">{resetInfo}</FormMessage>}
          </CardFooter>
        </form>
      </Card>
    </Center>
  )
}