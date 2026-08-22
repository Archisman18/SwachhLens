import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getOfflineQueue, flushOfflineQueue } from '../api/offlineQueue.js'
import { useCitizenAuth } from '../context/CitizenAuthContext.jsx'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { citizen, logout: citizenLogout } = useCitizenAuth()
  const [queuedCount, setQueuedCount] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  // Listen for PWA Install Prompt
  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault()
      setInstallPrompt(e)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstallClick() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  // Offline queue listener
  useEffect(() => {
    function updateQueueState() {
      const q = getOfflineQueue()
      setQueuedCount(q.length)
    }

    updateQueueState()

    async function handleOnline() {
      updateQueueState()
      const flushed = await flushOfflineQueue()
      if (flushed.length > 0) {
        updateQueueState()
      }
    }

    window.addEventListener('online', handleOnline)
    const interval = setInterval(updateQueueState, 5000)

    if (navigator.onLine) {
      flushOfflineQueue().then(updateQueueState)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [])

  // Scroll spy to detect active section on Home Page
  useEffect(() => {
    if (location.pathname !== '/') {
      if (location.pathname === '/my-reports') {
        setActiveSection('my-reports')
      } else {
        setActiveSection('')
      }
      return
    }

    function onScroll() {
      const scrollPos = window.scrollY + 200
      const aboutEl = document.getElementById('about')
      const howItWorksEl = document.getElementById('how-it-works')

      if (howItWorksEl && scrollPos >= howItWorksEl.offsetTop) {
        setActiveSection('how-it-works')
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveSection('about')
      } else {
        setActiveSection('home')
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  // Cubic ease-in-out animated smooth scroll
  function animatedScrollTo(targetY, duration = 650) {
    const startY = window.pageYOffset || document.documentElement.scrollTop
    const difference = targetY - startY
    if (Math.abs(difference) < 4) return
    const startTime = performance.now()

    function step(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      window.scrollTo(0, startY + difference * ease)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

  function scrollToTargetId(targetId) {
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      const navbarHeight = 76
      const targetY = Math.max(0, targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - navbarHeight)
      animatedScrollTo(targetY, 700)
    }
  }

  // Handle hash navigation on initial load or change
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '')
      setTimeout(() => {
        scrollToTargetId(targetId)
      }, 120)
    }
  }, [location.pathname, location.hash])

  function handleHomeClick(e) {
    e?.preventDefault?.()
    setMobileMenuOpen(false)
    setActiveSection('home')
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        animatedScrollTo(0, 600)
      }, 80)
    } else {
      window.history.pushState(null, '', '/')
      animatedScrollTo(0, 600)
    }
  }

  function handleSectionClick(e, sectionId) {
    e?.preventDefault?.()
    setMobileMenuOpen(false)
    setActiveSection(sectionId)
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`)
    } else {
      window.history.pushState(null, '', `/#${sectionId}`)
      scrollToTargetId(sectionId)
    }
  }

  function handleCitizenLogout() {
    citizenLogout()
    navigate('/citizen-login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col app-shell">
      {/* Top Banner / Announcement Ticker */}
      <div className="marquee">
        <div className="marquee-inner">
          <span>CLEAN CITIES • AI-POWERED WASTE MANAGEMENT • CITIZEN DRIVEN • SWACHH BHARAT INITIATIVE • REAL-TIME DISPATCH • ZERO-WASTE COMMUNITIES •</span>
          <span>CLEAN CITIES • AI-POWERED WASTE MANAGEMENT • CITIZEN DRIVEN • SWACHH BHARAT INITIATIVE • REAL-TIME DISPATCH • ZERO-WASTE COMMUNITIES •</span>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="navbar">
        <div className="navbar-logo">
          <Link to="/" onClick={handleHomeClick} style={{ color: 'var(--charcoal)', textDecoration: 'none' }}>
            Swachh<span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--forest)' }}>Lens</span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <ul className="navbar-links">
            <li>
              <a
                href="/"
                onClick={handleHomeClick}
                style={{
                  fontWeight: activeSection === 'home' ? '700' : '400',
                  color: activeSection === 'home' ? 'var(--forest)' : 'var(--charcoal)',
                  cursor: 'pointer',
                  borderBottom: activeSection === 'home' ? '2px solid var(--forest)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => handleSectionClick(e, 'about')}
                style={{
                  fontWeight: activeSection === 'about' ? '700' : '400',
                  color: activeSection === 'about' ? 'var(--forest)' : 'var(--charcoal)',
                  cursor: 'pointer',
                  borderBottom: activeSection === 'about' ? '2px solid var(--forest)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                onClick={(e) => handleSectionClick(e, 'how-it-works')}
                style={{
                  fontWeight: activeSection === 'how-it-works' ? '700' : '400',
                  color: activeSection === 'how-it-works' ? 'var(--forest)' : 'var(--charcoal)',
                  cursor: 'pointer',
                  borderBottom: activeSection === 'how-it-works' ? '2px solid var(--forest)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                How It Works
              </a>
            </li>
            <li>
              <Link
                to="/my-reports"
                style={{
                  fontWeight: activeSection === 'my-reports' ? '700' : '400',
                  color: activeSection === 'my-reports' ? 'var(--forest)' : 'var(--charcoal)',
                  borderBottom: activeSection === 'my-reports' ? '2px solid var(--forest)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                My Reports
              </Link>
            </li>
          </ul>
        </nav>

        {/* Actions & Hamburger Toggle */}
        <div className="navbar-actions">
          {citizen && (
            <div className="desktop-only-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--forest)' }} title={`${citizen.name} (${citizen.phone})`}>
                ✓ {citizen.name.split(' ')[0]}
              </span>
              <button
                onClick={handleCitizenLogout}
                style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--stone)', cursor: 'pointer', textDecoration: 'underline' }}
                title="Sign Out Citizen"
              >
                Logout
              </button>
            </div>
          )}

          <a
            href="http://localhost:5174/login"
            className="btn btn-outline desktop-only-btn"
            style={{ padding: '8px 16px', fontSize: '0.72rem', borderColor: 'var(--stone-light)' }}
            title="Municipal Authority Login"
          >
            🛡️ Officer Login
          </a>

          <Link to="/report" className="btn btn-primary nav-report-btn">
            Report Waste
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="font-serif text-lg font-bold text-charcoal">
                Swachh<span className="italic text-forest">Lens</span>
              </span>
              <button
                className="close-drawer-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <ul className="mobile-nav-list">
              <li>
                <a
                  href="/"
                  onClick={handleHomeClick}
                  className={activeSection === 'home' ? 'active-mobile-link' : ''}
                >
                  🏡 Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleSectionClick(e, 'about')}
                  className={activeSection === 'about' ? 'active-mobile-link' : ''}
                >
                  🌿 About Initiative
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSectionClick(e, 'how-it-works')}
                  className={activeSection === 'how-it-works' ? 'active-mobile-link' : ''}
                >
                  ⚙️ How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className={activeSection === 'my-reports' ? 'active-mobile-link' : ''}
                >
                  📋 My Submitted Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-report-link"
                >
                  📸 Report Waste Now
                </Link>
              </li>
            </ul>

            <div className="mobile-drawer-footer">
              {citizen && (
                <div style={{ marginBottom: '14px', padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--forest)' }}>
                      ✓ {citizen.name}
                    </span>
                    <button
                      onClick={handleCitizenLogout}
                      style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#C62828', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                    >
                      Logout
                    </button>
                  </div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--stone)', marginTop: '2px' }}>
                    {citizen.phone}
                  </span>
                </div>
              )}

              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="btn btn-outline w-full mb-3"
                  style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--forest)', color: 'var(--forest)' }}
                >
                  📲 Install Web App
                </button>
              )}

              <a
                href="http://localhost:5174/login"
                className="btn btn-outline w-full"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
              >
                🛡️ Municipal Officer Login
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Offline Alert Banner */}
      {queuedCount > 0 && (
        <div className="offline-banner">
          <span>⚡</span>
          <span>{queuedCount} report{queuedCount > 1 ? 's' : ''} saved offline — auto-syncing when connected.</span>
        </div>
      )}

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* PWA Floating Install Prompt */}
      {installPrompt && !installed && (
        <div className="pwa-install-banner">
          <div className="pwa-install-info">
            <span className="pwa-icon">🌿</span>
            <div>
              <strong>Install SwachhLens</strong>
              <p>Add to home screen for instant camera access &amp; offline reports.</p>
            </div>
          </div>
          <div className="pwa-install-actions">
            <button onClick={handleInstallClick} className="btn-pwa-install">
              Install
            </button>
            <button onClick={() => setInstallPrompt(null)} className="btn-pwa-dismiss">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Editorial Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-logo">
              Swachh<span style={{ fontStyle: 'italic', color: '#A3D9B1' }}>Lens</span>
            </div>
            <p className="footer-tagline">
              Elevating urban sanitation through computer vision, automated priority dispatch, and citizen empowerment.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Navigation</h4>
              <a href="/" onClick={handleHomeClick}>Home</a>
              <Link to="/report">Report Waste</Link>
              <Link to="/my-reports">My Reports Track</Link>
              <a href="http://localhost:5174" target="_blank" rel="noreferrer">Control Room</a>
            </div>

            <div className="footer-links-column">
              <h4>Classification</h4>
              <a href="#categories" onClick={(e) => handleSectionClick(e, 'categories')}>Plastic &amp; Debris</a>
              <a href="#categories" onClick={(e) => handleSectionClick(e, 'categories')}>Overflowing Bins</a>
              <a href="#categories" onClick={(e) => handleSectionClick(e, 'categories')}>Hazardous &amp; E-Waste</a>
              <a href="#categories" onClick={(e) => handleSectionClick(e, 'categories')}>Bio Degradable</a>
            </div>

            <div className="footer-links-column">
              <h4>Initiative</h4>
              <a href="#about" onClick={(e) => handleSectionClick(e, 'about')}>Clean Neighborhoods</a>
              <a href="#how-it-works" onClick={(e) => handleSectionClick(e, 'how-it-works')}>Municipal Integration</a>
              <Link to="/report">Zero Dump Mission</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} SwachhLens Initiative. Designed with minimalist elegance for cleaner cities.
        </div>
      </footer>
    </div>
  )
}
