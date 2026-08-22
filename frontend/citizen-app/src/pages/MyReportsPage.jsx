import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getComplaintStatus } from '../api/client.js'
import { getReportIds, syncValidReportIds } from '../api/localReports.js'

export default function MyReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const ids = getReportIds()
      if (ids.length === 0) {
        setLoading(false)
        return
      }

      const results = await Promise.allSettled(ids.map((id) => getComplaintStatus(id)))
      const valid = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value)

      setReports(valid)
      syncValidReportIds(valid.map((r) => r.id))
      setLoading(false)
    }
    load()
  }, [])

  function getCategoryIcon(type) {
    switch (type) {
      case 'overflowing_bin': return '🗑️'
      case 'plastic_waste': return '🍾'
      case 'illegal_dump': return '⚠️'
      case 'hazardous_waste':
      case 'e_waste': return '⚡'
      case 'construction_debris': return '🧱'
      case 'organic_waste': return '🍂'
      default: return '📍'
    }
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 24px 100px' }}>
      <div className="page-container" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="heading-sm">YOUR CIVIC CONTRIBUTIONS</span>
            <h1 className="heading-lg" style={{ marginTop: '4px' }}>
              My <span className="italic" style={{ color: 'var(--maroon)' }}>Reports</span>
            </h1>
          </div>

          <Link to="/report" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.75rem' }}>
            + New Report
          </Link>
        </div>

        {loading && <p className="loading-text">Loading your submitted reports...</p>}

        {!loading && reports.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🌱</span>
            <h3 className="heading-md" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Reports Yet</h3>
            <p className="text-body" style={{ maxWidth: '360px', margin: '0 auto 24px' }}>
              You haven't submitted any waste reports from this device yet. See litter or an overflowing bin? Log it now!
            </p>
            <Link to="/report" className="btn btn-primary">
              Submit First Report
            </Link>
          </div>
        )}

        {!loading && reports.map((r) => (
          <div
            key={r.id}
            className="report-card"
            onClick={() => navigate(`/confirmation/${r.id}`)}
          >
            <div className="report-card-icon">
              {getCategoryIcon(r.waste_type)}
            </div>

            <div className="report-card-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="report-card-title">
                  {r.waste_type ? r.waste_type.replace(/_/g, ' ') : 'Analyzing Photo...'}
                </h4>
                <span className={`badge badge-${r.urgency || 'low'}`}>
                  {r.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--stone)' }}>
                <span>{new Date(r.reported_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>&middot;</span>
                <span>Vol: {r.volume_bucket || 'Estimated'}</span>
                <span>&middot;</span>
                <span>Score: {r.priority_score || 0}</span>
              </div>
            </div>

            <span style={{ color: 'var(--stone-light)', fontSize: '1.2rem' }}>&rsaquo;</span>
          </div>
        ))}
      </div>
    </div>
  )
}