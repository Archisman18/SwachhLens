import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import StatusTracker from '../components/StatusTracker.jsx'
import { getComplaintStatus } from '../api/client.js'

export default function ConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getComplaintStatus(id)
        setComplaint(data)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [id])

  function copyTrackingId() {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <div className="error-message">{error}</div>
        <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => navigate('/report')}>
          Back to Report Form
        </button>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <p className="loading-text">Fetching live report status...</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 24px 100px' }}>
      <div className="page-container" style={{ maxWidth: '640px' }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#E8F5E9',
            color: 'var(--forest)',
            fontSize: '1.4rem',
            marginBottom: '12px'
          }}>
            ✓
          </span>
          <h1 className="heading-lg">Report <span className="italic" style={{ color: 'var(--forest)' }}>Logged</span></h1>
          <p className="text-body" style={{ marginTop: '4px' }}>
            Your submission has been cataloged and prioritized for municipal response.
          </p>
        </div>

        {/* Tracking ID Pill */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--cream-dark)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--stone)' }}>Tracking ID:</span>
          <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '600', color: 'var(--charcoal)' }}>
            {complaint.id.slice(0, 13)}...
          </code>
          <button
            onClick={copyTrackingId}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              color: 'var(--forest)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Main Status & Details Card */}
        <div className="card" style={{ padding: '32px' }}>
          {complaint.photo_url && (
            <div style={{ marginBottom: '24px', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <img
                src={complaint.photo_url}
                alt="Submitted Waste"
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <span className="heading-sm">DISPATCH LIFECYCLE</span>
            <StatusTracker status={complaint.status} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          {/* AI Vision Insights */}
          <div>
            <span className="heading-sm">AI CLASSIFICATION REPORT</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginTop: '12px'
            }}>
              <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', textTransform: 'uppercase' }}>Waste Type</span>
                <p style={{ margin: '4px 0 0', fontWeight: '600', textTransform: 'capitalize', color: 'var(--charcoal)' }}>
                  {complaint.waste_type ? complaint.waste_type.replace(/_/g, ' ') : 'Analyzing...'}
                </p>
              </div>

              <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', textTransform: 'uppercase' }}>Volume Bucket</span>
                <p style={{ margin: '4px 0 0', fontWeight: '600', textTransform: 'capitalize', color: 'var(--charcoal)' }}>
                  {complaint.volume_bucket ? complaint.volume_bucket.replace(/_/g, ' ') : 'Analyzing...'}
                </p>
              </div>

              <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', textTransform: 'uppercase' }}>Urgency Tier</span>
                <p style={{ margin: '4px 0 0', fontWeight: '600' }}>
                  <span className={`badge badge-${complaint.urgency || 'low'}`}>
                    {complaint.urgency || 'Normal'}
                  </span>
                </p>
              </div>

              <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--stone)', textTransform: 'uppercase' }}>Priority Index</span>
                <p style={{ margin: '4px 0 0', fontWeight: '600', color: 'var(--charcoal)' }}>
                  {complaint.priority_score || 0} / 50
                </p>
              </div>
            </div>

            {complaint.assigned_team && (
              <div style={{
                marginTop: '16px',
                background: '#E8F5E9',
                border: '1px solid #C8E6C9',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--forest)', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Unit</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                    {complaint.assigned_team} ({complaint.assigned_vehicle || 'Standard Vehicle'})
                  </p>
                </div>
                <span style={{ fontSize: '1.2rem' }}>🚛</span>
              </div>
            )}

            {complaint.comment && (
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--stone)' }}>
                <em>"{complaint.comment}"</em>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, padding: '14px' }}
            onClick={() => navigate('/report')}
          >
            Report Another Area
          </button>
          <Link
            to="/my-reports"
            className="btn btn-outline"
            style={{ flex: 1, padding: '14px' }}
          >
            My Past Reports
          </Link>
        </div>
      </div>
    </div>
  )
}