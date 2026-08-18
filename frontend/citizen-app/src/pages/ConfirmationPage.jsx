import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StatusTracker from '../components/StatusTracker.jsx'
import { getComplaintStatus } from '../api/client.js'

export default function ConfirmationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setComplaint(await getComplaintStatus(id))
      } catch (e) {
        setError(e.message)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [id])

  if (error) return <div className="app-shell"><p style={{ color: 'red' }}>{error}</p></div>
  if (!complaint) return <div className="app-shell"><p>Loading...</p></div>

  return (
    <div className="app-shell">
      <h1>Report Submitted</h1>
      <p>Tracking ID: {complaint.id}</p>
      <p>Waste type: {complaint.waste_type || 'Analyzing...'}</p>
      <p>Volume: {complaint.volume_bucket || 'Analyzing...'}</p>
      <StatusTracker status={complaint.status} />
      <button className="primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
        Report Another Issue
      </button>
    </div>
  )
}