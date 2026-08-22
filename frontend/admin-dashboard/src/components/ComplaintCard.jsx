import React from 'react'

export default function ComplaintCard({ complaint, onClick }) {
  const urgency = complaint.urgency || 'low'
  const badgeStyles = {
    critical: 'bg-[#FDE8E8] text-[#C62828] border-[#FBD5D5]',
    high: 'bg-[#FFF3E0] text-[#EF6C00] border-[#FFE0B2]',
    medium: 'bg-[#FFF8E1] text-[#F9A825] border-[#FFECB3]',
    low: 'bg-[#E8F5E9] text-[#2D5A3D] border-[#C8E6C9]',
  }[urgency] || 'bg-[#F0EBE3] text-[#2C2C2C] border-[#E5E0D8]'

  return (
    <div
      className="bg-white border border-stone-border rounded-lg p-3.5 mb-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group"
      onClick={onClick}
    >
      {complaint.photo_url && (
        <div className="w-full h-32 rounded-md overflow-hidden mb-3 bg-cream-dark">
          <img
            src={complaint.photo_url}
            alt="Reported waste"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-serif font-semibold text-base text-charcoal capitalize">
            {complaint.waste_type ? complaint.waste_type.replace(/_/g, ' ') : 'Analyzing Photo...'}
          </h3>
          <p className="text-xs text-stone mt-0.5">
            Vol: <span className="font-medium text-charcoal capitalize">{complaint.volume_bucket ? complaint.volume_bucket.replace(/_/g, ' ') : 'Estimated'}</span>
          </p>
        </div>

        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
          {urgency}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-stone-border/60 text-xs">
        <span className="text-stone">
          Priority Score: <strong className="text-charcoal font-semibold">{complaint.priority_score || 0}</strong>
        </span>

        <span className="text-[11px] text-stone">
          {new Date(complaint.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {complaint.assigned_team && (
        <div className="mt-2 text-[11px] bg-cream-dark/80 text-forest font-medium px-2 py-1 rounded flex items-center justify-between">
          <span>Assigned: {complaint.assigned_team}</span>
          <span className="text-[10px] uppercase font-bold text-stone">{complaint.status}</span>
        </div>
      )}
    </div>
  )
}
