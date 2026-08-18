import ComplaintCard from './ComplaintCard.jsx'

export default function ComplaintQueue({ complaints = [], onSelect }) {
  return (
    <div className="overflow-y-auto h-full p-3">
      <h2 className="font-bold text-lg mb-3">Priority Queue</h2>
      {complaints.length === 0 && <p className="text-gray-400 text-sm">No active complaints.</p>}
      {complaints.map((c) => (
        <ComplaintCard key={c.id} complaint={c} onClick={() => onSelect(c.id)} />
      ))}
    </div>
  )
}
