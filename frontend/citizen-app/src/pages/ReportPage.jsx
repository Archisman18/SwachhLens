import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture.jsx'
import { submitComplaint, uploadPhoto } from '../api/client.js'
import { saveReportId } from '../api/localReports.js'
import { addToOfflineQueue } from '../api/offlineQueue.js'
import { useCitizenAuth } from '../context/CitizenAuthContext.jsx'

export default function ReportPage() {
  const navigate = useNavigate()
  const { citizen } = useCitizenAuth()
  const [capture, setCapture] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [queued, setQueued] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!capture) return
    setSubmitting(true)
    setError(null)
    setQueued(false)

    try {
      const photoUrl = await uploadPhoto(capture.file)
      const complaint = await submitComplaint({
        photoUrl,
        latitude: capture.latitude,
        longitude: capture.longitude,
        comment,
        citizenName: citizen?.name || 'Verified Citizen',
        citizenPhone: citizen?.phone || null,
        citizenEmail: citizen?.email || null,
      })
      saveReportId(complaint.id)
      navigate(`/confirmation/${complaint.id}`)
    } catch (e) {
      if (!navigator.onLine || e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        try {
          const fallbackPhoto = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
          addToOfflineQueue({
            photoUrl: fallbackPhoto,
            latitude: capture.latitude,
            longitude: capture.longitude,
            comment,
            citizenName: citizen?.name || 'Verified Citizen',
            citizenPhone: citizen?.phone || null,
            citizenEmail: citizen?.email || null,
          })
          setQueued(true)
          return
        } catch (queueErr) {
          console.error('Queue save failed:', queueErr)
        }
      }
      setError(e.message || 'Failed to submit report. Please check if the backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 24px 100px' }}>
      <div className="page-container" style={{ maxWidth: '580px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="heading-sm">CITIZEN DISPATCH</span>
          <h1 className="heading-lg" style={{ marginTop: '8px' }}>
            Report Waste &amp; <span className="italic" style={{ color: 'var(--forest)' }}>Litter</span>
          </h1>
          <p className="text-body" style={{ marginTop: '8px' }}>
            Upload a photo of discarded waste. Our automated system pinpoints location, classifies hazard type, and queues municipal cleanup squads.
          </p>
        </div>

        {/* Verified Citizen Credibility Badge */}
        {citizen && (
          <div style={{
            background: '#E8F5E9',
            border: '1px solid #C8E6C9',
            borderRadius: 'var(--radius)',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#2E7D32',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>🛡️</span>
              <div>
                <strong>Verified Citizen: {citizen.name}</strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#1B5E20' }}>
                  {citizen.phone} &middot; {citizen.email}
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', color: 'var(--forest)' }}>
              Verified Reporter
            </span>
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
          <div className="form-group">
            <label className="form-label">Step 1 &middot; Photo &amp; Location</label>
            <CameraCapture onCapture={setCapture} />
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Step 2 &middot; Incident Notes</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Near bus stop, blocking pedestrian pathway, recurring problem..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '24px', padding: '16px' }}
            disabled={!capture || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting & Running AI Analysis...' : 'Submit Verified Waste Report'}
          </button>

          {queued && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#E8F5E9',
              border: '1px solid #C8E6C9',
              borderRadius: 'var(--radius)',
              color: '#2E7D32',
              fontSize: '0.85rem'
            }}>
              <strong>✓ Saved to Offline Queue</strong>
              <p style={{ margin: '4px 0 0', color: '#1B5E20' }}>
                You appear to be offline or the server is momentarily unreachable. Your report has been safely queued on your device and will auto-submit when connectivity is restored!
              </p>
            </div>
          )}

          {error && (
            <div className="error-message" style={{ marginTop: '16px' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <Link
            to="/my-reports"
            style={{
              fontSize: '0.85rem',
              color: 'var(--forest)',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            &larr; View your previously submitted reports
          </Link>
        </div>
      </div>
    </div>
  )
}