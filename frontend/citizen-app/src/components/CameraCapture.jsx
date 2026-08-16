import { useRef, useState } from 'react'

/**
 * Captures a photo (native camera input on mobile) and the device's
 * current GPS position. Passes both up via onCapture.
 */
export default function CameraCapture({ onCapture }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture({
          file,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (err) => setError(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="primary" onClick={() => fileInputRef.current.click()}>
        Take Photo
      </button>
      {preview && <img src={preview} alt="preview" style={{ width: '100%', marginTop: 12, borderRadius: 8 }} />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
