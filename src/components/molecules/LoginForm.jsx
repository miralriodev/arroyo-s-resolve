import styled from 'styled-components'
import { useState } from 'react'
import { useAuth } from '../../supabase/AuthContext.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../atoms/Card'
import Label from '../atoms/Label'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import FormMessage from '../atoms/FormMessage'

const Center = styled.main`
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
`

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

export default function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'
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
      navigate(redirect)
    } catch (err) {
      setError(err?.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
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
          </CardFooter>
        </form>
      </Card>
    </Center>
  )
}