import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getOfflineQueue, flushOfflineQueue } from '../api/offlineQueue.js'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [queuedCount, setQueuedCount] = useState(0)
  const [activeSection, setActiveSection] = useState('home')

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
    e.preventDefault()
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
    e.preventDefault()
    setActiveSection(sectionId)
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`)
    } else {
      window.history.pushState(null, '', `/#${sectionId}`)
      scrollToTargetId(sectionId)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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

        <nav>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="http://localhost:5174/login"
            className="btn btn-outline"
            style={{ padding: '8px 18px', fontSize: '0.72rem', borderColor: 'var(--stone-light)' }}
            title="Municipal Authority Login"
          >
            🛡️ Officer Login
          </a>
          <Link to="/report" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.75rem' }}>
            Report Waste
          </Link>
        </div>
      </header>

      {queuedCount > 0 && (
        <div style={{
          background: '#FFF3E0',
          borderBottom: '1px solid #FFE0B2',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: '#E65100',
          fontWeight: '500'
        }}>
          <span>⚡</span>
          <span>{queuedCount} report{queuedCount > 1 ? 's' : ''} queued offline — will automatically submit when online.</span>
        </div>
      )}

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

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
