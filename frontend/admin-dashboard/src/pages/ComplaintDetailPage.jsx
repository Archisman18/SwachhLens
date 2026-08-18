import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getComplaint, assignComplaint, updateStatus } from '../api/client.js'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [team, setTeam] = useState('')
  const [vehicle, setVehicle] = useState('')

  async function load() {
    const data = await getComplaint(id)
    setComplaint(data)
    setTeam(data.assigned_team || '')
    setVehicle(data.assigned_vehicle || '')
  }

  useEffect(() => { load() }, [id])

  if (!complaint) return <p className="p-4">Loading...</p>

  async function handleAssign() {
    await assignComplaint(id, team, vehicle)
    load()
  }

  async function handleStatusChange(status) {
    await updateStatus(id, status)
    load()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button className="text-brand mb-4" onClick={() => navigate('/')}>&larr; Back to dashboard</button>
      {complaint.photo_url && (
        <img src={complaint.photo_url} alt="Reported waste" className="w-full h-64 object-cover rounded mb-4" />
      )}
      <h1 className="text-2xl font-bold capitalize">{complaint.waste_type || 'Unclassified'}</h1>
      <p className="text-gray-600">Volume: {complaint.volume_bucket || 'unknown'} &middot; Priority: {complaint.priority_score}</p>
      <p className="text-gray-600">Urgency: {complaint.urgency || 'n/a'} &middot; Status: {complaint.status}</p>
      <p className="text-gray-600">Reported: {new Date(complaint.reported_at).toLocaleString()}</p>
      {complaint.comment && <p className="mt-2 italic">"{complaint.comment}"</p>}

      <div className="mt-6 border-t pt-4">
        <h2 className="font-semibold mb-2">Assign Response</h2>
        <input className="border rounded p-2 w-full mb-2" placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} />
        <input className="border rounded p-2 w-full mb-2" placeholder="Vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
        <button className="bg-brand text-white px-4 py-2 rounded" onClick={handleAssign}>Assign</button>
      </div>

      <div className="mt-6 border-t pt-4">
        <h2 className="font-semibold mb-2">Update Status</h2>
        <div className="flex gap-2">
          {['reported', 'assigned', 'cleaned', 'verified'].map((s) => (
            <button
              key={s}
              className={`px-3 py-1 rounded text-sm ${complaint.status === s ? 'bg-brand text-white' : 'bg-gray-100'}`}
              onClick={() => handleStatusChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}