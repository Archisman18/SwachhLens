import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

const DEFAULT_CENTER = [22.5726, 88.3639] // placeholder city center - change to your demo city

export default function MapView({ complaints = [] }) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.latitude, c.longitude]}
          radius={6 + (c.priority_score || 0) / 5}
          pathOptions={{ color: severityColor(c.urgency) }}
        >
          <Popup>
            <div>
              <strong>{c.waste_type || 'unclassified'}</strong>
              <p>Volume: {c.volume_bucket || 'unknown'}</p>
              <p>Priority: {c.priority_score}</p>
              <p>Status: {c.status}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

function severityColor(urgency) {
  switch (urgency) {
    case 'critical': return '#c62828'
    case 'high': return '#ef6c00'
    case 'medium': return '#f9a825'
    default: return '#2e7d32'
  }
}
