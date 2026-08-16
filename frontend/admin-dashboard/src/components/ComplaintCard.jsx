export default function ComplaintCard({ complaint, onAssign }) {
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold capitalize">{complaint.waste_type || 'Unclassified'}</p>
          <p className="text-sm text-gray-500">
            Volume: {complaint.volume_bucket || 'unknown'} &middot; Priority: {complaint.priority_score}
          </p>
          <p className="text-sm text-gray-500">Status: {complaint.status}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-brand-light text-brand-dark capitalize">
          {complaint.urgency || 'n/a'}
        </span>
      </div>
      {complaint.status === 'reported' && (
        <button
          className="mt-2 text-sm bg-brand text-white px-3 py-1 rounded"
          onClick={() => onAssign(complaint.id)}
        >
          Assign recommended response
        </button>
      )}
    </div>
  )
}
