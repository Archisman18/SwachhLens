const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function getHotspots() {
  const res = await fetch(`${API_BASE}/dashboard/hotspots`)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export async function getQueue() {
  const res = await fetch(`${API_BASE}/dashboard/queue`)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export async function assignComplaint(id, team, vehicle) {
  const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigned_team: team, assigned_vehicle: vehicle }),
  })
  if (!res.ok) throw new Error(`Assign failed: ${res.status}`)
  return res.json()
}
