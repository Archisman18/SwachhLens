import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CitizenAuthProvider } from './context/CitizenAuthContext.jsx'
import CitizenProtectedRoute from './components/CitizenProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import MyReportsPage from './pages/MyReportsPage.jsx'
import CitizenLoginPage from './pages/CitizenLoginPage.jsx'

export default function App() {
  return (
    <CitizenAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Citizen Login Route */}
          <Route path="/citizen-login" element={<CitizenLoginPage />} />

          {/* Strictly Protected Citizen Portal Routes */}
          <Route
            element={
              <CitizenProtectedRoute>
                <Layout />
              </CitizenProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/confirmation/:id" element={<ConfirmationPage />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CitizenAuthProvider>
  )
}