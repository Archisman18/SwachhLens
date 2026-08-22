import React from 'react'

const STEPS = [
  { id: 'reported', label: 'Reported', num: '1' },
  { id: 'assigned', label: 'Assigned', num: '2' },
  { id: 'cleaned', label: 'Cleaned', num: '3' },
  { id: 'verified', label: 'Verified', num: '4' },
]

export default function StatusTracker({ status }) {
  if (status === 'duplicate') {
    return (
      <div style={{
        background: '#FFF3E0',
        border: '1px solid #FFE0B2',
        borderRadius: 'var(--radius)',
        padding: '16px',
        textAlign: 'center',
        margin: '24px 0'
      }}>
        <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>ℹ️</span>
        <strong style={{ color: '#E65100', fontSize: '0.9rem' }}>Marked as Duplicate</strong>
        <p style={{ fontSize: '0.8rem', color: '#6D4C41', margin: '4px 0 0' }}>
          An active complaint is already logged for this exact location. It has been merged into the active queue.
        </p>
      </div>
    )
  }

  const stepIds = STEPS.map(s => s.id)
  const currentIndex = stepIds.indexOf(status) !== -1 ? stepIds.indexOf(status) : 0

  return (
    <div className="status-tracker">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex
        const isActive = idx === currentIndex

        return (
          <div
            key={step.id}
            className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="status-dot">
              {isCompleted ? '✓' : step.num}
            </div>
            <span className="status-step-label">
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
