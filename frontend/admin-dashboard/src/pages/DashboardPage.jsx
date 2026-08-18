import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/MapView.jsx'
import ComplaintQueue from '../components/ComplaintQueue.jsx'
import { getHotspots, getQueue } from '../api/client.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [hotspots, setHotspots] = useState([])
  const [queue, setQueue] = useState([])

  async function refresh() {
    const [h, q] = await Promise.all([getHotspots(), getQueue()])
    setHotspots(h)
    setQueue(q)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex">
      <div className="w-2/3 h-full">
        <MapView complaints={hotspots} />
      </div>
      <div className="w-1/3 h-full border-l">
        <ComplaintQueue complaints={queue} onSelect={(id) => navigate(`/complaint/${id}`)} />
      </div>
    </div>
  )
}