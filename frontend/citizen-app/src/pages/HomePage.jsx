import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      {/* ── 1. Hero Section ── */}
      <section className="hero">
        <h1 className="heading-xl">
          Transform Your Neighborhood with <span className="italic" style={{ color: 'var(--maroon)' }}>Smart Sanitation</span>
        </h1>
        <p className="text-body" style={{ maxWidth: '640px', margin: '0 auto 28px', fontSize: '1.05rem' }}>
          Capture street waste in seconds. Our AI vision instantly classifies trash, estimates severity, and dispatches dedicated municipal squads.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/report" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '0.85rem' }}>
            Report An Issue
          </Link>
          <a
            href="#how-it-works"
            className="btn btn-outline"
            style={{ padding: '16px 36px', fontSize: '0.85rem' }}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Explore Process
          </a>
        </div>

        {/* 3-Image Grid like reference Hero */}
        <div className="hero-images">
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
            <img
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
              alt="Clean green urban street"
              onError={(e) => { e.target.src = '/images/hero.jpg' }}
            />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
            <img
              src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
              alt="Community clean streets"
              onError={(e) => { e.target.src = '/images/about.jpg' }}
            />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }}>
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
              alt="Sustainable city aerial view"
              onError={(e) => { e.target.src = '/images/aerial.jpg' }}
            />
          </div>
        </div>
      </section>

      {/* ── 2. Editorial About Section (Split layout like reference image 2) ── */}
      <section id="about" className="about-section">
        <div style={{ overflow: 'hidden', height: '100%', minHeight: '520px' }}>
          <img
            src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1000&q=80"
            alt="Municipal waste management and urban sanitation in action"
            className="about-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80'
            }}
          />
        </div>
        <div className="about-content">
          <span className="heading-sm">ABOUT SWACHHLENS &middot; EST. 2026</span>
          <h2 className="heading-lg" style={{ marginTop: '8px' }}>
            A Standard of <span className="italic">Civic Excellence</span>
          </h2>
          <p className="text-body">
            We believe that clean public spaces are the foundation of vibrant communities. SwachhLens connects conscious citizens directly with rapid municipal response teams using cutting-edge computer vision.
          </p>
          <p className="text-body" style={{ marginTop: '-16px', marginBottom: '36px' }}>
            Every photo submitted is analyzed in real-time — categorizing debris, measuring volume density, and routing high-priority hazards within minutes.
          </p>
          <div>
            <Link to="/report" className="btn btn-outline">
              Join The Initiative
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Maroon Editorial Waste Types Section (like reference image 3) ── */}
      <section id="categories" className="section section-maroon">
        <div className="section-center">
          <span className="heading-sm" style={{ color: '#E5C4C4' }}>AI CLASSIFICATION CATEGORIES</span>
          <h2 className="heading-lg" style={{ color: 'var(--cream)', marginTop: '12px', marginBottom: '16px' }}>
            Intelligent waste recognition for <span className="italic">every scenario</span>
          </h2>
          <p className="text-body" style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
            Our vision pipeline automatically distinguishes waste categories to allocate appropriate machinery and crew.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {[
            {
              title: 'Overflowing Bins',
              desc: 'High-traffic collection bins near public transport & markets.',
              img: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=600&q=80',
              urgency: 'High'
            },
            {
              title: 'Plastic & Bottles',
              desc: 'Recyclables routed straight to partner sorting facilities.',
              img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
              urgency: 'Medium'
            },
            {
              title: 'Illegal Dumping',
              desc: 'Large accumulation on streets & empty lots requiring mini-trucks.',
              img: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
              urgency: 'Critical'
            },
            {
              title: 'Hazard & E-Waste',
              desc: 'Chemical or electronic waste requiring specialized protective gear.',
              img: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80',
              urgency: 'Critical'
            }
          ].map((cat, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                textAlign: 'left',
                transition: 'transform 0.3s var(--ease)',
              }}
            >
              <img
                src={cat.img}
                alt={cat.title}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  marginBottom: '16px'
                }}
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--cream)', marginBottom: '6px' }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(250, 247, 242, 0.75)', lineHeight: 1.5 }}>
                {cat.desc}
              </p>
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: cat.urgency === 'Critical' ? '#C62828' : cat.urgency === 'High' ? '#EF6C00' : '#2D5A3D',
                  color: 'white'
                }}>
                  {cat.urgency} Urgency
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. How It Works Section ── */}
      <section id="how-it-works" className="section section-cream">
        <div className="section-center">
          <span className="heading-sm">SEAMLESS CIVIC ACTION</span>
          <h2 className="heading-lg" style={{ marginTop: '12px', marginBottom: '16px' }}>
            How SwachhLens <span className="italic">Works</span>
          </h2>
          <p className="text-body" style={{ maxWidth: '600px', margin: '0 auto' }}>
            A transparent pipeline from citizen report to verified clean street in three simple steps.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-icon">📸</span>
            <span className="heading-sm" style={{ color: 'var(--maroon)', marginBottom: '8px', display: 'block' }}>STEP 01</span>
            <h3 className="heading-md">Snap &amp; Geotag</h3>
            <p className="text-body">
              Take a clear photo with your smartphone. Your device's GPS accurately pins the exact location coordinates.
            </p>
          </div>

          <div className="step-card">
            <span className="step-icon">🧠</span>
            <span className="heading-sm" style={{ color: 'var(--maroon)', marginBottom: '8px', display: 'block' }}>STEP 02</span>
            <h3 className="heading-md">AI Vision Scoring</h3>
            <p className="text-body">
              Our neural network classifies the waste category, computes spatial volume ratio, and screens duplicate reports.
            </p>
          </div>

          <div className="step-card">
            <span className="step-icon">🚛</span>
            <span className="heading-sm" style={{ color: 'var(--maroon)', marginBottom: '8px', display: 'block' }}>STEP 03</span>
            <h3 className="heading-md">Priority Dispatch</h3>
            <p className="text-body">
              Municipal sanitation teams receive dynamic recommendations on team type and vehicle requirement.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Call To Action Section ── */}
      <section className="section" style={{ background: 'var(--charcoal)', color: 'var(--white)', textAlign: 'center', padding: '70px 24px' }}>
        <div className="section-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span className="heading-sm" style={{ color: '#A3D9B1' }}>CIVIC ACTION</span>
          <h2 className="heading-lg" style={{ color: 'var(--white)', marginTop: '12px', marginBottom: '16px' }}>
            Keep your neighborhood <span className="italic">clean and safe</span>
          </h2>
          <p className="text-body" style={{ color: 'rgba(255, 255, 255, 0.75)', marginBottom: '32px' }}>
            Spot an overflowing bin or roadside debris? Submit a quick geotagged photo to dispatch municipal teams.
          </p>
          <Link to="/report" className="btn btn-primary" style={{ background: 'var(--cream)', color: 'var(--charcoal)', padding: '16px 40px' }}>
            Report Waste Now
          </Link>
        </div>
      </section>
    </div>
  )
}
