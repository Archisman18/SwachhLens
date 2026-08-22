import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register Service Worker for PWA support
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('SwachhLens PWA ServiceWorker active:', reg.scope)
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
