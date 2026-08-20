import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

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
          <Link to="/" style={{ color: 'var(--charcoal)', textDecoration: 'none' }}>
            Swachh<span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--forest)' }}>Lens</span>
          </Link>
        </div>

        <nav>
          <ul className="navbar-links">
            <li>
              <Link to="/" style={{ fontWeight: location.pathname === '/' ? '600' : '400' }}>Home</Link>
            </li>
            <li>
              <Link to="/#about">About</Link>
            </li>
            <li>
              <Link to="/#how-it-works">How It Works</Link>
            </li>
            <li>
              <Link to="/my-reports" style={{ fontWeight: location.pathname === '/my-reports' ? '600' : '400' }}>My Reports</Link>
            </li>
          </ul>
        </nav>

        <div>
          <Link to="/report" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.75rem' }}>
            Report Waste
          </Link>
        </div>
      </header>

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
              <Link to="/">Home</Link>
              <Link to="/report">Report Waste</Link>
              <Link to="/my-reports">My Reports Track</Link>
              <a href="http://localhost:5174" target="_blank" rel="noreferrer">Control Room</a>
            </div>

            <div className="footer-links-column">
              <h4>Classification</h4>
              <a href="#categories">Plastic & Debris</a>
              <a href="#categories">Overflowing Bins</a>
              <a href="#categories">Hazardous & E-Waste</a>
              <a href="#categories">Bio Degradable</a>
            </div>

            <div className="footer-links-column">
              <h4>Initiative</h4>
              <a href="#mission">Clean Neighborhoods</a>
              <a href="#mission">Municipal Integration</a>
              <a href="#mission">Zero Dump Mission</a>
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
