import React, { useState } from 'react'
import ComplaintCard from './ComplaintCard.jsx'

export default function ComplaintQueue({ complaints = [], onSelect }) {
  const [filter, setFilter] = useState('all') // 'all' | 'urgent' | 'assigned'
  const [search, setSearch] = useState('')

  const filtered = complaints.filter((c) => {
    // Tab filter
    if (filter === 'urgent' && c.urgency !== 'critical' && c.urgency !== 'high') return false
    if (filter === 'assigned' && c.status !== 'assigned') return false
    if (filter === 'reported' && c.status !== 'reported') return false

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      const type = (c.waste_type || '').toLowerCase()
      const comment = (c.comment || '').toLowerCase()
      const team = (c.assigned_team || '').toLowerCase()
      return type.includes(q) || comment.includes(q) || team.includes(q)
    }

    return true
  })

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Header */}
      <div className="p-4 border-b border-stone-border bg-white">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone">LIVE FEED</span>
            <h2 className="font-serif text-lg font-bold text-charcoal">
              Priority Queue
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-dark text-charcoal border border-stone-border">
            {complaints.length} Active
          </span>
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Filter by waste type or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs px-3 py-2 bg-cream border border-stone-border rounded-md outline-none focus:border-forest text-charcoal mb-3"
        />

        {/* Filter Tabs */}
        <div className="flex gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Queue' },
            { id: 'urgent', label: '🚨 Urgent' },
            { id: 'reported', label: 'Pending' },
            { id: 'assigned', label: 'Dispatched' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-charcoal text-white font-semibold'
                  : 'bg-cream-dark text-stone hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <span className="text-2xl block mb-2">🌿</span>
            <p className="text-sm font-serif text-charcoal">No incidents in this view</p>
            <p className="text-xs text-stone mt-1">All reports in this category have been addressed.</p>
          </div>
        )}

        {filtered.map((c) => (
          <ComplaintCard key={c.id} complaint={c} onClick={() => onSelect(c.id)} />
        ))}
      </div>
    </div>
  )
}
