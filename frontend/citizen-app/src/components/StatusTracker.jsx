const STEPS = ['reported', 'assigned', 'cleaned', 'verified']

export default function StatusTracker({ status }) {
  const currentIndex = STEPS.indexOf(status)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ textAlign: 'center', opacity: i <= currentIndex ? 1 : 0.4 }}>
          <div
            style={{
              width: 12, height: 12, borderRadius: '50%', margin: '0 auto',
              background: i <= currentIndex ? '#2e7d32' : '#ccc',
            }}
          />
          <div style={{ fontSize: 12, marginTop: 4, textTransform: 'capitalize' }}>{step}</div>
        </div>
      ))}
    </div>
  )
}
