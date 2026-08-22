import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCitizenAuth } from '../context/CitizenAuthContext.jsx'

const rawAdminBase = import.meta.env.VITE_ADMIN_BASE || import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'
const cleanAdminBase = rawAdminBase.replace(/\/login\/?$/, '').replace(/\/$/, '')
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || `${cleanAdminBase}/login`

export default function CitizenLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, demoLogin, loading } = useCitizenAuth()

  // Tab mode: 'signin' or 'register'
  const [authMode, setAuthMode] = useState('signin')

  // Form Fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Default to Home page ('/') after login
  const destination = location.state?.from && location.state.from !== '/citizen-login' 
    ? location.state.from 
    : '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (authMode === 'register') {
      // Validation for Register
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }

      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile phone number.')
        return
      }

      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.')
        return
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.')
        return
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.')
        return
      }

      const res = await signUp({ name, phone, email, password })
      if (res.success) {
        setSuccessMsg('Account created successfully! Entering portal...')
        setTimeout(() => {
          navigate(destination, { replace: true })
        }, 300)
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your details.')
      }
    } else {
      // Validation for Sign In
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both your email address and password.')
        return
      }

      const res = await signIn({ email, password })
      if (res.success) {
        navigate(destination, { replace: true })
      } else {
        setErrorMsg(res.error || 'Sign in failed. Please check your credentials or register an account.')
      }
    }
  }

  function handleAutoFillDemo() {
    demoLogin({
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      email: 'priya.sharma@gmail.com'
    })
    navigate(destination, { replace: true })
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 24px' }}>
      {/* Top Brand Bar */}
      <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.6rem' }}>🌿</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--charcoal)' }}>
            Swachh<span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--forest)' }}>Lens</span>
          </span>
        </div>

        <a
          href={ADMIN_URL}
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: '600',
            color: 'var(--stone)',
            textDecoration: 'none'
          }}
        >
          🛡️ Officer Login &rarr;
        </a>
      </div>

      {/* Center Auth Card */}
      <div className="page-container" style={{ maxWidth: '480px', width: '100%', margin: '30px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--cream-dark)',
            fontSize: '1.6rem',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            🇮🇳
          </div>
          <span className="heading-sm" style={{ color: 'var(--forest)' }}>MANDATORY CITIZEN AUTHENTICATION</span>
          <h1 className="heading-lg" style={{ marginTop: '4px', fontSize: '1.75rem' }}>
            {authMode === 'register' ? (
              <>Create <span className="italic" style={{ color: 'var(--forest)' }}>Account</span></>
            ) : (
              <>Citizen <span className="italic" style={{ color: 'var(--forest)' }}>Sign In</span></>
            )}
          </h1>
          <p className="text-body" style={{ marginTop: '4px', fontSize: '0.82rem', lineHeight: '1.5' }}>
            {authMode === 'register'
              ? 'Register with your name, phone & email to report waste and track cleanups.'
              : 'Sign in to access the citizen portal and track your verified civic reports.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div style={{
          display: 'flex',
          background: 'var(--cream-dark)',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '20px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: authMode === 'signin' ? 'var(--white)' : 'transparent',
              color: authMode === 'signin' ? 'var(--charcoal)' : 'var(--stone)',
              fontWeight: authMode === 'signin' ? '700' : '500',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: authMode === 'signin' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              background: authMode === 'register' ? 'var(--white)' : 'transparent',
              color: authMode === 'register' ? 'var(--charcoal)' : 'var(--stone)',
              fontWeight: authMode === 'register' ? '700' : '500',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: authMode === 'register' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Register New Account
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#FDE8E8',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        <div className="card" style={{ padding: '32px 28px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Register-only fields */}
            {authMode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', color: 'var(--charcoal)' }}>
                    Citizen Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      background: 'var(--cream)',
                      fontSize: '0.9rem',
                      color: 'var(--charcoal)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', color: 'var(--charcoal)' }}>
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      background: 'var(--cream)',
                      fontSize: '0.9rem',
                      color: 'var(--charcoal)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', color: 'var(--charcoal)' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.sharma@gmail.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--cream)',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', color: 'var(--charcoal)' }}>
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--cream)',
                  fontSize: '0.9rem',
                  color: 'var(--charcoal)',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Confirm Password for Registration */}
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', color: 'var(--charcoal)' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--cream)',
                    fontSize: '0.9rem',
                    color: 'var(--charcoal)',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '8px', width: '100%', padding: '14px', fontSize: '0.85rem' }}
            >
              {loading
                ? 'Authenticating with Supabase...'
                : authMode === 'register'
                ? 'Create Account & Enter Portal \u2192'
                : 'Sign In & Enter Portal \u2192'}
            </button>
          </form>

          {/* Toggle link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {authMode === 'signin' ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--stone)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--forest)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Register here
                </button>
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--stone)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--forest)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In here
                </button>
              </span>
            )}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.75rem', padding: '10px', borderColor: 'var(--stone-light)' }}
            >
              ⚡ Instant Demo Citizen (Priya Sharma)
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--stone)', maxWidth: '480px', margin: '0 auto' }}>
        &copy; {new Date().getFullYear()} Swachh Bharat Urban Cleanliness Initiative. Powered by Supabase Auth.
      </div>
    </div>
  )
}
