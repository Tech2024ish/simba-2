import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  }, [])

  const syncSessionState = useCallback(async (nextSession) => {
    setSession(nextSession)
    setUser(nextSession?.user ?? null)

    if (!nextSession?.user) {
      setProfile(null)
      return
    }

    try {
      const p = await fetchProfile(nextSession.user.id)
      setProfile(p)
    } catch {
      setProfile(null)
    }
  }, [fetchProfile])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSessionState(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncSessionState(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [syncSessionState])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await syncSessionState(data.session ?? null)
    return data
  }, [syncSessionState])

  const register = useCallback(async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'buyer', phone: phone || '' }
      }
    })
    if (error) throw error
    return data
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [])

  const getToken = useCallback(async () => {
    const currentToken = session?.access_token
    if (currentToken) return currentToken

    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    const nextSession = data.session ?? null
    setSession(nextSession)
    setUser(nextSession?.user ?? null)
    if (!nextSession?.user) {
      setProfile(null)
    } else {
      fetchProfile(nextSession.user.id)
        .then((p) => setProfile(p))
        .catch(() => setProfile(null))
    }

    return nextSession?.access_token || null
  }, [fetchProfile, session?.access_token])

  const isMarketRep = profile?.role === 'market_rep'

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, getToken, isMarketRep }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { supabase }
