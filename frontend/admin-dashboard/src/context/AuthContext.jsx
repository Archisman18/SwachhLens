import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'swachhlens_admin_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser = {
            email: session.user.email,
            role: 'Municipal Officer',
            id: session.user.id,
          }
          setUser(authUser)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser = {
            email: session.user.email,
            role: 'Municipal Officer',
            id: session.user.id,
          }
          setUser(authUser)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
        } else {
          setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    setLoading(true)
    try {
      // If Supabase is configured and not using standard demo shortcut
      if (supabase && email && password && email.includes('@') && password.length >= 6) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error && data?.user) {
          const authUser = {
            email: data.user.email,
            role: 'Municipal Officer',
            id: data.user.id,
          }
          setUser(authUser)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
          return { success: true }
        }
      }

      // Default / Municipal Demo Bypass Login
      if (email && password) {
        const authUser = {
          email: email.trim(),
          role: 'Municipal Sanitation Officer',
          id: 'officer-demo-1',
          displayName: email.split('@')[0] || 'Officer',
        }
        setUser(authUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
        return { success: true }
      }

      throw new Error('Please provide valid officer credentials.')
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    if (supabase) {
      supabase.auth.signOut().catch(() => {})
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
