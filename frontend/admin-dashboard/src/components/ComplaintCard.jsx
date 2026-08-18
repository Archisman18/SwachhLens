export default function ComplaintCard({ complaint, onClick }) {
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white shadow-sm cursor-pointer hover:shadow-md" onClick={onClick}>
      {complaint.photo_url && (
        <img
          src={complaint.photo_url}
          alt="Reported waste"
          className="w-full h-32 object-cover rounded mb-2"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )}
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
    </div>
  )
}
