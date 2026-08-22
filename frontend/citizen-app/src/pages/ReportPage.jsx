import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture.jsx'
import { submitComplaint, uploadPhoto } from '../api/client.js'
import { saveReportId } from '../api/localReports.js'

export default function ReportPage() {
  const navigate = useNavigate()
  const [capture, setCapture] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!capture) return
    setSubmitting(true)
    setError(null)
    try {
      const photoUrl = await uploadPhoto(capture.file)
      const complaint = await submitComplaint({
        photoUrl,
        latitude: capture.latitude,
        longitude: capture.longitude,
        comment,
      })
      saveReportId(complaint.id)
      navigate(`/confirmation/${complaint.id}`)
    } catch (e) {
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

        <div className="card" style={{ padding: '32px' }}>
          <div className="form-group">
            <label className="form-label">Step 1 &middot; Photo &amp; Location</label>
            <CameraCapture onCapture={setCapture} />
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Step 2 &middot; Optional Details</label>
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
            style={{ width: '100%', marginTop: '12px', padding: '16px' }}
            disabled={!capture || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting & Running AI Analysis...' : 'Submit Waste Report'}
          </button>

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