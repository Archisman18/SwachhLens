import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView.jsx'
import ComplaintQueue from '../components/ComplaintQueue.jsx'
import { getHotspots, getQueue, getAnalytics } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [hotspots, setHotspots] = useState([])
  const [queue, setQueue] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [mobileTab, setMobileTab] = useState('map')

  async function refresh() {
    try {
      const [h, q, a] = await Promise.all([getHotspots(), getQueue(), getAnalytics()])
      setHotspots(h || [])
      setQueue(q || [])
      setAnalytics(a || null)
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

  // Analytics helpers
  const totalComplaints = analytics
    ? Object.values(analytics.by_status).reduce((s, c) => s + c, 0)
    : 0

  const statusColors = {
    reported: '#EF6C00',
    assigned: '#1565C0',
    cleaned: '#2E7D32',
    verified: '#4CAF50',
    duplicate: '#9E9E9E',
  }

  const wasteTypeLabels = {
    overflowing_bin: 'Overflowing Bin',
    illegal_dump: 'Illegal Dump',
    plastic_waste: 'Plastic Waste',
    construction_debris: 'Construction',
    organic_waste: 'Organic Waste',
    e_waste: 'E-Waste',
    hazardous_waste: 'Hazardous',
    drain_blockage: 'Drain Blockage',
    other: 'Other',
    unclassified: 'Unclassified',
  }

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              showAnalytics
                ? 'bg-forest text-white border-forest'
                : 'border-stone-border bg-cream-dark text-charcoal hover:bg-forest hover:text-white'
            }`}
          >
            📊 Analytics
          </button>

          <button
            onClick={refresh}
            className="text-xs text-stone hover:text-charcoal hidden sm:flex items-center gap-1.5 transition-colors"
            title="Force refresh data"
          >
            <span>🔄</span>
            <span>Sync: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </button>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border border-stone-border bg-cream-dark text-charcoal hover:bg-forest hover:text-white transition-colors"
          >
            Citizen Portal ↗
          </a>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-border">
              <span className="text-xs text-stone font-medium hidden md:inline" title={user.email}>
                👤 {user.displayName || user.email.split('@')[0]}
              </span>
              <button
                onClick={logout}
                className="text-xs text-stone hover:text-red-700 underline font-medium"
                title="Sign out"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Analytics Panel (collapsible) ── */}
      {showAnalytics && analytics && (
        <div className="bg-white border-b border-stone-border px-6 py-5 flex-shrink-0 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* Status Breakdown */}
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-3">
                BY STATUS ({totalComplaints} TOTAL)
              </span>
              <div className="space-y-2">
                {Object.entries(analytics.by_status).map(([status, count]) => {
                  const pct = totalComplaints > 0 ? (count / totalComplaints) * 100 : 0
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="capitalize text-charcoal font-medium">{status}</span>
                        <span className="text-stone">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: statusColors[status] || '#9E9E9E',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Waste Type Breakdown */}
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-3">
                BY WASTE TYPE
              </span>
              <div className="space-y-2">
                {Object.entries(analytics.by_waste_type)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const pct = totalComplaints > 0 ? (count / totalComplaints) * 100 : 0
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-charcoal font-medium">
                            {wasteTypeLabels[type] || type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-stone">{count}</span>
                        </div>
                        <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-forest transition-all duration-500"
                            style={{ width: `${pct}%`, opacity: 0.5 + (pct / 200) }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* 30-Day Trend */}
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-3">
                30-DAY TREND
              </span>
              {analytics.daily_trend.length > 0 ? (
                <div className="flex items-end gap-px h-32">
                  {(() => {
                    const maxCount = Math.max(...analytics.daily_trend.map(d => d.count), 1)
                    return analytics.daily_trend.map((day, i) => {
                      const heightPct = (day.count / maxCount) * 100
                      return (
                        <div
                          key={i}
                          className="flex-1 group relative"
                          title={`${day.date}: ${day.count} reports`}
                        >
                          <div
                            className="w-full bg-forest/70 rounded-t-sm hover:bg-forest transition-colors cursor-pointer"
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-charcoal text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                            {day.date}: {day.count}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <p className="text-xs text-stone italic">No data in the last 30 days.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Tab Switcher (Visible only on < md screens) ── */}
      <div className="md:hidden flex border-b border-stone-border bg-white flex-shrink-0">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-colors ${
            mobileTab === 'map'
              ? 'text-forest border-b-2 border-forest bg-cream/50'
              : 'text-stone hover:text-charcoal'
          }`}
        >
          🗺️ Live Map ({hotspots.length})
        </button>
        <button
          onClick={() => setMobileTab('queue')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-colors ${
            mobileTab === 'queue'
              ? 'text-forest border-b-2 border-forest bg-cream/50'
              : 'text-stone hover:text-charcoal'
          }`}
        >
          📋 Triage Queue ({queue.length})
        </button>
      </div>

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map View */}
        <div className={`flex-1 h-full relative ${mobileTab === 'map' ? 'block' : 'hidden md:block'}`}>
          <MapView complaints={hotspots} />
        </div>

        {/* Priority Queue Sidebar */}
        <div className={`w-full md:w-96 h-full md:border-l border-stone-border flex-shrink-0 ${mobileTab === 'queue' ? 'block' : 'hidden md:block'}`}>
          <ComplaintQueue
            complaints={queue}
            onSelect={(id) => navigate(`/complaint/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}