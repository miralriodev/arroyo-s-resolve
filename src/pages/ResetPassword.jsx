import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabase.config.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/atoms/Card'
import Label from '../components/atoms/Label'
import Input from '../components/atoms/Input'
import Button from '../components/atoms/Button'
import FormMessage from '../components/atoms/FormMessage'

const Center = styled.main`
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  background: ${({ theme }) => theme.colors.background};
`

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

export default function ResetPassword() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) setMode('update')
    }
    init()
  }, [])

  const onRequest = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cambiar-contraseña`,
      })
      if (err) throw err
      setInfo('Revisa tu correo para continuar')
    } catch (err) {
      setError(err?.message ?? 'Error al solicitar cambio de contraseña')
    } finally {
      setLoading(false)
    }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (!password || password !== confirm) throw new Error('Las contraseñas no coinciden')
      const { data, error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      if (data?.user) setInfo('Contraseña actualizada')
      navigate('/login')
    } catch (err) {
      setError(err?.message ?? 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>{mode === 'request' ? 'Ingresa tu email para recibir el enlace.' : 'Ingresa una nueva contraseña.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'request' ? (
            <form onSubmit={onRequest} style={{ display: 'grid', gap: 16 }}>
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@ejemplo.com" required />
              </Field>
              <Actions>
                <Button type="submit" disabled={loading} style={{ backgroundColor: '#f3f4f6', color: '#111', border: '1px solid #e5e7eb' }}>{loading ? 'Enviando…' : 'Enviar enlace'}</Button>
              </Actions>
              {error && <FormMessage tone="error">{error}</FormMessage>}
              {info && <FormMessage tone="success">{info}</FormMessage>}
            </form>
          ) : (
            <form onSubmit={onUpdate} style={{ display: 'grid', gap: 16 }}>
              <Field>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </Field>
              <Field>
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
              </Field>
              <Actions>
                <Button type="submit" disabled={loading || !password || password !== confirm} style={{ backgroundColor: '#f3f4f6', color: '#111', border: '1px solid #e5e7eb' }}>{loading ? 'Guardando…' : 'Guardar contraseña'}</Button>
              </Actions>
              {error && <FormMessage tone="error">{error}</FormMessage>}
              {info && <FormMessage tone="success">{info}</FormMessage>}
            </form>
          )}
        </CardContent>
        <CardFooter />
      </Card>
    </Center>
  )
}
