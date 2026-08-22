import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const CITIZEN_URL = (import.meta.env.VITE_CITIZEN_URL || (isLocal ? 'http://localhost:5173' : 'https://swachhlens-rouge.vercel.app')).replace(/\/$/, '')

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both municipal officer email and password.')
      return
    }

    const res = await login(email, password)
    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.')
    }
  }

  function handleQuickDemoLogin() {
    setEmail('admin@swachhlens.gov.in')
    setPassword('officer2026')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between p-6">
      {/* Top Banner Bar */}
      <div className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-serif font-bold text-xl text-charcoal">
            Swachh<span className="italic text-forest">Lens</span>
          </span>
        </div>

        <a
          href={CITIZEN_URL}
          className="text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full border border-stone-border bg-white text-charcoal hover:bg-forest hover:text-white transition-colors"
        >
          &larr; Switch to Citizen View
        </a>
      </div>

      {/* Center Login Box */}
      <div className="max-w-md w-full mx-auto bg-white border border-stone-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cream mb-3">
            <span className="text-xl">🛡️</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Municipal Officer Login</h2>
          <p className="text-xs text-stone mt-1 uppercase tracking-wider font-semibold">
            Swachh Bharat Urban Dispatch &amp; Triage Control Room
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Officer Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@swachhlens.gov.in"
              className="w-full px-3.5 py-2.5 bg-cream border border-stone-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-forest transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-cream border border-stone-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-forest transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-charcoal text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-forest transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Control Room'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-border flex flex-col gap-2">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2 bg-cream hover:bg-cream-dark text-stone text-xs rounded-lg font-medium transition-colors text-center border border-dashed border-stone-border"
          >
            ⚡ Auto-Fill Demo Credentials (admin@swachhlens.gov.in)
          </button>

          <p className="text-[11px] text-stone text-center mt-2">
            Are you a citizen looking to report street waste?{' '}
            <a href={`${CITIZEN_URL}/report`} className="text-forest underline font-medium">
              Submit a report here
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-stone max-w-md mx-auto">
        &copy; {new Date().getFullYear()} SwachhLens Municipal Decision Support System. Authorized Personnel Only.
      </div>
    </div>
  )
}
