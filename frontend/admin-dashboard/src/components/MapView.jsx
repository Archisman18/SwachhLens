import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'

const DEFAULT_CENTER = [22.5726, 88.3639] // Kolkata default city center

export default function MapView({ complaints = [] }) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        className="w-full h-full"
        style={{ background: '#F0EBE3' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {complaints.map((c) => {
          const color = severityColor(c.urgency)
          const radius = Math.min(16, Math.max(8, 7 + (c.priority_score || 0) / 4))

          return (
            <CircleMarker
              key={c.id}
              center={[c.latitude, c.longitude]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  {c.photo_url && (
                    <img
                      src={c.photo_url}
                      alt="Waste preview"
                      className="w-full h-24 object-cover rounded mb-2"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif font-bold capitalize text-sm text-[#2C2C2C]">
                      {c.waste_type ? c.waste_type.replace(/_/g, ' ') : 'Unclassified'}
                    </h4>
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: color + '20',
                        color: color,
                      }}
                    >
                      {c.urgency || 'Normal'}
                    </span>
                  </div>

                  <p className="text-xs text-[#8A8578] mb-1">
                    Volume: <strong className="text-[#2C2C2C] capitalize">{c.volume_bucket || 'Unknown'}</strong> &middot; Score: <strong>{c.priority_score}</strong>
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#E5E0D8] flex justify-between items-center">
                    <span className="text-[11px] capitalize text-[#8A8578]">Status: {c.status}</span>
                    <Link
                      to={`/complaint/${c.id}`}
                      className="text-xs font-semibold text-[#2D5A3D] hover:underline"
                    >
                      Inspect &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-[#FAF7F2]/90 backdrop-blur border border-[#E5E0D8] rounded-lg p-3 shadow-md text-xs">
        <span className="block font-semibold uppercase tracking-wider text-[10px] text-[#8A8578] mb-2">
          Urgency Legend
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" />
            <span className="text-[#2C2C2C]">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF6C00]" />
            <span className="text-[#2C2C2C]">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F9A825]" />
            <span className="text-[#2C2C2C]">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A3D]" />
            <span className="text-[#2C2C2C]">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function severityColor(urgency) {
  switch (urgency) {
    case 'critical': return '#C62828'
    case 'high': return '#EF6C00'
    case 'medium': return '#F9A825'
    default: return '#2D5A3D'
  }
}
