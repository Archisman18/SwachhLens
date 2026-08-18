import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture.jsx'
import { submitComplaint, uploadPhoto } from '../api/client.js'
import { saveReportId } from '../api/localReports.js'

export default function ReportPage() {
  const navigate = useNavigate()
  const [capture, setCapture] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
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
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
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
      <button
        style={{ marginTop: 20, background: 'none', border: 'none', color: '#2e7d32', textDecoration: 'underline' }}
        onClick={() => navigate('/my-reports')}
      >
        View my past reports
      </button>
    </div>
  )
}