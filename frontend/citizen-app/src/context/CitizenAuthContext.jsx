import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient.js'

const CitizenAuthContext = createContext(null)
const STORAGE_KEY = 'swachhlens_citizen_profile'

export function CitizenAuthProvider({ children }) {
  const [citizen, setCitizen] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Sync Supabase Auth session on initial mount
  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const profile = {
          id: session.user.id,
          name: meta.name || session.user.email.split('@')[0] || 'Verified Citizen',
          phone: meta.phone || '',
          email: session.user.email,
          isVerified: true,
        }
        setCitizen(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const profile = {
          id: session.user.id,
          name: meta.name || session.user.email.split('@')[0] || 'Verified Citizen',
          phone: meta.phone || '',
          email: session.user.email,
          isVerified: true,
        }
        setCitizen(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      } else {
        // If logged out from Supabase and not a demo profile
        if (!localStorage.getItem(STORAGE_KEY)?.includes('demo-citizen')) {
          setCitizen(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 1. Sign Up / Register New Account with Supabase
  async function signUp({ name, phone, email, password }) {
    setLoading(true)
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
            },
          },
        })

        if (error) throw error

        const user = data.user
        const profile = {
          id: user?.id || `cit-${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          isVerified: true,
        }
        setCitizen(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
        return { success: true, user: profile }
      }

      // Fallback if Supabase not connected
      const profile = {
        id: `cit-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        isVerified: true,
      }
      setCitizen(profile)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      return { success: true, user: profile }
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  // 2. Sign In to Existing Account with Supabase
  async function signIn({ email, password }) {
    setLoading(true)
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        })

        if (error) throw error

        const user = data.user
        const meta = user.user_metadata || {}
        const profile = {
          id: user.id,
          name: meta.name || user.email.split('@')[0] || 'Verified Citizen',
          phone: meta.phone || '',
          email: user.email,
          isVerified: true,
        }
        setCitizen(profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
        return { success: true, user: profile }
      }

      throw new Error('Supabase client is not available.')
    } catch (err) {
      return { success: false, error: err.message || 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  // 3. Demo / Instant Shortcut Login
  function demoLogin(profileData) {
    const verifiedCitizen = {
      id: 'demo-citizen-1',
      name: profileData.name.trim(),
      email: profileData.email.trim(),
      phone: profileData.phone.trim(),
      isVerified: true,
      registeredAt: new Date().toISOString(),
    }
    setCitizen(verifiedCitizen)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedCitizen))
    return { success: true, user: verifiedCitizen }
  }

  // 4. Logout
  function logout() {
    if (supabase) {
      supabase.auth.signOut().catch(() => {})
    }
    setCitizen(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <CitizenAuthContext.Provider
      value={{
        citizen,
        isAuthenticated: Boolean(citizen),
        loading,
        signUp,
        signIn,
        demoLogin,
        logout,
      }}
    >
      {children}
    </CitizenAuthContext.Provider>
  )
}

export function useCitizenAuth() {
  const ctx = useContext(CitizenAuthContext)
  if (!ctx) {
    throw new Error('useCitizenAuth must be used within a CitizenAuthProvider')
  }
  return ctx
}
