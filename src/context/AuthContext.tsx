import React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  isSupabaseConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  const isSupabaseConfigured = Boolean(supabase)

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const guard = React.useCallback(() => {
    if (!supabase) throw new Error('Supabase is not configured')
  }, [])

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      guard()
      const { error } = await supabase!.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    [guard],
  )

  const signUp = React.useCallback(
    async (email: string, password: string) => {
      guard()
      const { error } = await supabase!.auth.signUp({ email, password })
      if (error) throw error
    },
    [guard],
  )

  const signOut = React.useCallback(async () => {
    guard()
    const { error } = await supabase!.auth.signOut()
    if (error) throw error
  }, [guard])

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, isSupabaseConfigured, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
