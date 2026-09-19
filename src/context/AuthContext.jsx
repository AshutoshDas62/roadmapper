import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!isMounted) return
      if (error) setAuthError(error.message)
      setSession(data.session)
      setIsLoading(false)
    }

    loadSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp({ email, password, username, fullName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw error
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, isLoading, authError, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
