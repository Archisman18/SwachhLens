import { supabase } from './supabaseClient.js'

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

export async function uploadPhoto(file) {
  if (!supabase) {
    // Development fallback when Supabase storage is not yet connected
    console.warn('Supabase not configured: using fallback waste photo URL for demonstration.')
    return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage
    .from('waste-photos')
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('waste-photos')
    .getPublicUrl(fileName)

  return data.publicUrl
}