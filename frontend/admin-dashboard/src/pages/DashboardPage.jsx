import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView.jsx'
import ComplaintQueue from '../components/ComplaintQueue.jsx'
import { getHotspots, getQueue } from '../api/client.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [hotspots, setHotspots] = useState([])
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  async function refresh() {
    try {
      const [h, q] = await Promise.all([getHotspots(), getQueue()])
      setHotspots(h || [])
      setQueue(q || [])
      setLastRefreshed(new Date())
    } catch (e) {
      console.warn('Dashboard fetch error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [])

  // Derived stats
  const criticalCount = queue.filter(q => q.urgency === 'critical' || q.urgency === 'high').length
  const pendingCount = queue.filter(q => q.status === 'reported').length
  const assignedCount = queue.filter(q => q.status === 'assigned').length

  return (
    <div className="h-screen flex flex-col bg-cream overflow-hidden">
      {/* ── Top Control Room Header ── */}
      <header className="h-16 px-6 bg-white border-b border-stone-border flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight text-charcoal">
                Swachh<span className="italic text-forest">Lens</span>
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-stone block">
                MUNICIPAL CONTROL ROOM &middot; DISPATCH CENTER
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-border" />

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-stone text-[10px] uppercase tracking-wider block">Total Hotspots</span>
              <strong className="font-serif text-sm text-charcoal">{hotspots.length}</strong>
            </div>

            <div>
              <span className="text-stone text-[10px] uppercase tracking-wider block">Pending Review</span>
              <strong className="font-serif text-sm text-charcoal">{pendingCount}</strong>
            </div>

            <div>
              <span className="text-stone text-[10px] uppercase tracking-wider block">🚨 Critical Alerts</span>
              <strong className="font-serif text-sm text-[#C62828]">{criticalCount}</strong>
            </div>

            <div>
              <span className="text-stone text-[10px] uppercase tracking-wider block">Active Dispatches</span>
              <strong className="font-serif text-sm text-forest">{assignedCount}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={refresh}
            className="text-xs text-stone hover:text-charcoal flex items-center gap-1.5 transition-colors"
            title="Force refresh data"
          >
            <span>🔄</span>
            <span>Sync: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </button>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border border-stone-border bg-cream-dark text-charcoal hover:bg-forest hover:text-white transition-colors"
          >
            Citizen App &rarr;
          </a>
        </div>
      </header>

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map View */}
        <div className="flex-1 h-full relative">
          <MapView complaints={hotspots} />
        </div>

        {/* Right: Priority Queue Sidebar */}
        <div className="w-96 h-full border-l border-stone-border flex-shrink-0">
          <ComplaintQueue
            complaints={queue}
            onSelect={(id) => navigate(`/complaint/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}