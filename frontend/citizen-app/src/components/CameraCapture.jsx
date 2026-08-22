import React, { useRef, useState } from 'react'

export default function CameraCapture({ onCapture }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setError(null)
    setLocating(true)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCoords({ lat, lng })
        setLocating(false)
        onCapture({
          file,
          latitude: lat,
          longitude: lng,
        })
      },
      (err) => {
        // Fallback default coordinates (e.g. Kolkata demo) if user denies permission
        const fallbackLat = 22.5726
        const fallbackLng = 88.3639
        setCoords({ lat: fallbackLat, lng: fallbackLng })
        setLocating(false)
        setError(`Location warning: Using approximate city coordinates (${err.message})`)
        onCapture({
          file,
          latitude: fallbackLat,
          longitude: fallbackLng,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleReset() {
    setPreview(null)
    setCoords(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onCapture(null)
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

      {!preview ? (
        <div
          className="upload-area"
          onClick={() => fileInputRef.current.click()}
        >
          <span className="upload-icon">📷</span>
          <h3 className="heading-sm">TAP TO CAPTURE OR UPLOAD PHOTO</h3>
          <p className="text-body" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            High resolution photos help AI classify waste accurately.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '16px', padding: '10px 24px', fontSize: '0.75rem' }}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            Select Image
          </button>
        </div>
      ) : (
        <div className="upload-preview card" style={{ padding: '8px' }}>
          <img
            src={preview}
            alt="Waste Preview"
            style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'calc(var(--radius) - 2px)' }}
          />
          <div style={{ padding: '12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {locating && <span style={{ fontSize: '0.8rem', color: 'var(--stone)' }}>📍 Pinning GPS coordinates...</span>}
              {coords && (
                <span style={{ fontSize: '0.8rem', color: 'var(--forest)', fontWeight: '500' }}>
                  📍 Geotagged: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--maroon)',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Retake Photo
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: '12px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
