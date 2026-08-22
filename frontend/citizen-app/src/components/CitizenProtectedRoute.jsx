import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCitizenAuth } from '../context/CitizenAuthContext.jsx'

export default function CitizenProtectedRoute({ children }) {
  const { isAuthenticated } = useCitizenAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/citizen-login" state={{ from: location.pathname }} replace />
  }

  return children
}
