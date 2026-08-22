import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getComplaint, assignComplaint, updateStatus } from '../api/client.js'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [team, setTeam] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('')
  const [showResolutionInput, setShowResolutionInput] = useState(false)

  async function load() {
    try {
      const data = await getComplaint(id)
      setComplaint(data)
      setTeam(data.assigned_team || '')
      setVehicle(data.assigned_vehicle || '')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleAssign(e) {
    e?.preventDefault()
    setSaving(true)
    try {
      await assignComplaint(id, team, vehicle)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status) {
    // If transitioning to "verified", show the resolution photo input first
    if (status === 'verified' && !resolutionPhotoUrl) {
      setShowResolutionInput(true)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const photoUrl = status === 'verified' ? resolutionPhotoUrl : null
      await updateStatus(id, status, photoUrl)
      setShowResolutionInput(false)
      setResolutionPhotoUrl('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg border border-stone-border text-center max-w-md">
          <p className="text-[#C62828] text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-wider font-semibold px-4 py-2 bg-charcoal text-white rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <p className="font-serif text-stone">Loading incident details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone hover:text-charcoal transition-colors"
          >
            <span>&larr;</span> Back to Control Room
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone">Incident ID:</span>
            <code className="text-xs font-mono font-semibold bg-cream-dark px-2 py-0.5 rounded border border-stone-border">
              {complaint.id}
            </code>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-[#FDE8E8] border border-[#FBD5D5] text-[#C62828] text-xs font-semibold px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Visual & Incident Data */}
          <div className="md:col-span-7 space-y-6">
            {/* Photo Card */}
            <div className="bg-white rounded-lg border border-stone-border overflow-hidden shadow-sm">
              {complaint.photo_url ? (
                <img
                  src={complaint.photo_url}
                  alt="Incident photograph"
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-cream-dark flex items-center justify-center text-stone text-sm">
                  No visual attachment
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-stone">
                      AI CLASSIFICATION
                    </span>
                    <h2 className="font-serif text-2xl font-bold capitalize text-charcoal">
                      {complaint.waste_type ? complaint.waste_type.replace(/_/g, ' ') : 'Analyzing Image...'}
                    </h2>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-cream-dark text-charcoal border border-stone-border">
                    Status: {complaint.status}
                  </span>
                </div>

                {complaint.comment && (
                  <div className="bg-cream p-4 rounded-md border border-stone-border/60 mb-4">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-1">
                      Citizen Notes
                    </span>
                    <p className="text-sm italic text-charcoal">"{complaint.comment}"</p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-stone-border/60">
                  <div>
                    <span className="text-stone block">Volume Estimate</span>
                    <strong className="text-charcoal capitalize text-sm">{complaint.volume_bucket ? complaint.volume_bucket.replace(/_/g, ' ') : 'Standard'}</strong>
                  </div>

                  <div>
                    <span className="text-stone block">Geotag Coordinates</span>
                    <strong className="text-charcoal font-mono text-xs">
                      {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone block">Reported Timestamp</span>
                    <strong className="text-charcoal text-xs">
                      {new Date(complaint.reported_at).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone block">Last Updated</span>
                    <strong className="text-charcoal text-xs">
                      {new Date(complaint.updated_at).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Photo Card (Feature 2.4) */}
            {complaint.resolution_photo_url && (
              <div className="bg-white rounded-lg border border-stone-border overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-forest">
                    ✓ VERIFIED CLEANUP — AFTER PHOTO
                  </span>
                </div>
                <img
                  src={complaint.resolution_photo_url}
                  alt="Resolution photograph — verified cleanup"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 text-xs text-stone">
                  Attached by the cleanup crew as proof of resolution.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dispatch Action Panel */}
          <div className="md:col-span-5 space-y-6">
            {/* Priority Score Summary Card */}
            <div className="bg-white rounded-lg border border-stone-border p-6 shadow-sm">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone">
                TRIAGE METRICS
              </span>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <span className="text-3xl font-serif font-bold text-charcoal">
                    {complaint.priority_score || 0}
                  </span>
                  <span className="text-xs text-stone"> / 50 Priority Index</span>
                </div>

                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  complaint.urgency === 'critical' ? 'bg-[#FDE8E8] text-[#C62828] border-[#FBD5D5]' :
                  complaint.urgency === 'high' ? 'bg-[#FFF3E0] text-[#EF6C00] border-[#FFE0B2]' :
                  'bg-[#E8F5E9] text-[#2D5A3D] border-[#C8E6C9]'
                }`}>
                  {complaint.urgency || 'Normal'} Urgency
                </span>
              </div>
            </div>

            {/* Response Assignment Form */}
            <div className="bg-white rounded-lg border border-stone-border p-6 shadow-sm">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-3">
                DISPATCH SANITATION SQUAD
              </span>

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                    Assigned Crew / Team
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 4 Rapid Cleaners"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-cream border border-stone-border rounded-md outline-none focus:border-forest text-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5">
                    Assigned Vehicle / Machinery
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mini Truck #08, Handcart"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-cream border border-stone-border rounded-md outline-none focus:border-forest text-charcoal"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-semibold text-stone block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { t: 'Sanitation Crew A', v: 'Mini Truck' },
                      { t: 'Hazard Response Unit', v: 'Specialized Van' },
                      { t: 'Recycling Partners', v: 'Collection Truck' },
                    ].map((p, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => { setTeam(p.t); setVehicle(p.v); }}
                        className="text-[10px] bg-cream-dark text-charcoal px-2 py-1 rounded hover:bg-stone-border transition-colors"
                      >
                        {p.t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !team}
                  className="w-full text-xs uppercase tracking-wider font-semibold py-3 px-4 rounded-full bg-forest text-white hover:bg-forest-dark disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Assigning Unit...' : 'Confirm Dispatch Assignment'}
                </button>
              </form>
            </div>

            {/* Lifecycle Status Updates */}
            <div className="bg-white rounded-lg border border-stone-border p-6 shadow-sm">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-stone block mb-3">
                UPDATE RESOLUTION STATUS
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'reported', label: '1. Reported' },
                  { id: 'assigned', label: '2. Assigned' },
                  { id: 'cleaned', label: '3. Cleaned' },
                  { id: 'verified', label: '4. Verified Clean' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStatusChange(s.id)}
                    disabled={saving}
                    className={`text-xs py-2 px-3 rounded-md font-semibold transition-all ${
                      complaint.status === s.id
                        ? 'bg-charcoal text-white shadow-sm'
                        : 'bg-cream text-stone hover:text-charcoal hover:bg-cream-dark'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Resolution Photo Input (Feature 2.4) */}
              {showResolutionInput && (
                <div className="mt-4 p-4 bg-cream rounded-lg border border-stone-border/60 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-forest block mb-1">
                      📷 PHOTO PROOF REQUIRED
                    </span>
                    <p className="text-xs text-stone">
                      Upload or paste the URL of the after-cleanup photo to verify resolution.
                    </p>
                  </div>

                  <input
                    type="url"
                    placeholder="https://... (URL of the resolution photo)"
                    value={resolutionPhotoUrl}
                    onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-stone-border rounded-md outline-none focus:border-forest text-charcoal"
                  />

                  {resolutionPhotoUrl && (
                    <div className="rounded-md overflow-hidden border border-stone-border">
                      <img
                        src={resolutionPhotoUrl}
                        alt="Resolution preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('verified')}
                      disabled={saving || !resolutionPhotoUrl}
                      className="flex-1 text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded-full bg-forest text-white hover:bg-forest-dark disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Verifying...' : 'Confirm Verified Clean'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowResolutionInput(false); setResolutionPhotoUrl('') }}
                      className="text-xs px-3 py-2.5 rounded-full bg-cream-dark text-stone hover:text-charcoal transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}