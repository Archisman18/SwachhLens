import { supabase } from './supabaseClient.js'

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:8000' : 'https://swachhlens-backend-3c7.onrender.com')

export async function submitComplaint({ photoUrl, latitude, longitude, comment, citizenName, citizenPhone, citizenEmail }) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photo_url: photoUrl,
      latitude,
      longitude,
      comment: comment || null,
      citizen_name: citizenName || null,
      citizen_phone: citizenPhone || null,
      citizen_email: citizenEmail || null,
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

  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from('waste-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.warn('Supabase storage upload error:', error.message)
      throw error
    }

    const { data } = supabase.storage
      .from('waste-photos')
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (err) {
    console.warn('Falling back to demonstration image URL due to storage upload policy:', err.message)
    return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  }
}