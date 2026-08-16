import { useState } from 'react'
import CameraCapture from './CameraCapture.jsx'
import { submitComplaint } from '../api/client.js'

export default function ReportForm() {
  const [capture, setCapture] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!capture) return
    setSubmitting(true)
    setError(null)
    try {
      // TODO: upload capture.file to Supabase storage first and use the
      // returned public URL here. Using a placeholder until that's wired up.
      const photoUrl = 'https://placeholder.example.com/upload-not-wired-yet.jpg'

      const complaint = await submitComplaint({
        photoUrl,
        latitude: capture.latitude,
        longitude: capture.longitude,
        comment,
      })
      setResult(complaint)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div>
        <h2>Report submitted</h2>
        <p>Tracking ID: {result.id}</p>
        <p>Status: {result.status}</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <h1>Report Waste</h1>
      <CameraCapture onCapture={setCapture} />
      <textarea
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ width: '100%', marginTop: 12, minHeight: 60 }}
      />
      <button
        className="primary"
        style={{ marginTop: 12 }}
        disabled={!capture || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
