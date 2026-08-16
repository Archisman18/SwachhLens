import { useEffect, useState } from 'react'
import MapView from './components/MapView.jsx'
import ComplaintQueue from './components/ComplaintQueue.jsx'
import { getHotspots, getQueue, assignComplaint } from './api/client.js'

export default function App() {
  const [hotspots, setHotspots] = useState([])
  const [queue, setQueue] = useState([])

  async function refresh() {
    const [h, q] = await Promise.all([getHotspots(), getQueue()])
    setHotspots(h)
    setQueue(q)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000) // simple polling for MVP
    return () => clearInterval(interval)
  }, [])

  async function handleAssign(id) {
    // TODO: let the authority pick/override team+vehicle; using the
    // backend's recommended values as defaults for now.
    await assignComplaint(id, 'manual cleanup team', 'handcart')
    refresh()
  }

  return (
    <div className="h-screen flex">
      <div className="w-2/3 h-full">
        <MapView complaints={hotspots} />
      </div>
      <div className="w-1/3 h-full border-l">
        <ComplaintQueue complaints={queue} onAssign={handleAssign} />
      </div>
    </div>
  )
}
