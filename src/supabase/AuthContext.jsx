import { createContext, useContext, useEffect, useState } from 'react'
import { useProfileSync } from '../hooks/useProfileSync'
import { supabase } from './supabase.config.jsx'

const AuthContext = createContext({ user: null, session: null, loading: true })

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const { syncProfile } = useProfileSync()

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Post-login: ensure profile is synced in backend
    await syncProfile()
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: {
      emailRedirectTo: 'https://www.cali-yoo.online/login',
    } })
    if (error) throw error
    // If session is returned (depending on email confirmation settings), sync profile
    await syncProfile({ full_name: data?.user?.user_metadata?.full_name })
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email) => {
    if (!email) throw new Error('Ingresa tu email')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.cali-yoo.online/cambiar-contraseña',
    })
    if (error) throw error
    return true
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
