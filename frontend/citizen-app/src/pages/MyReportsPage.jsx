import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getComplaintStatus } from '../api/client.js'
import { getReportIds } from '../api/localReports.js'

export default function MyReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const ids = getReportIds()
      const results = await Promise.allSettled(ids.map((id) => getComplaintStatus(id)))
      setReports(results.filter((r) => r.status === 'fulfilled').map((r) => r.value))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="app-shell">
      <h1>My Reports</h1>
      {loading && <p>Loading...</p>}
      {!loading && reports.length === 0 && <p>No reports submitted yet from this device.</p>}
      {reports.map((r) => (
        <div
          key={r.id}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8, cursor: 'pointer' }}
          onClick={() => navigate(`/confirmation/${r.id}`)}
        >
          <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{r.waste_type || 'Analyzing...'}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Status: {r.status}</p>
        </div>
      ))}
      <button className="primary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>
        + New Report
      </button>
    </div>
  )
}