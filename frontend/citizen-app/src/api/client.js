const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function submitComplaint({ photoUrl, latitude, longitude, comment }) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photo_url: photoUrl,
      latitude,
      longitude,
      comment: comment || null,
    }),
  })
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
  return res.json()
}

export async function getComplaintStatus(id) {
  const res = await fetch(`${API_BASE}/complaints/${id}`)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}
