import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import MyReportsPage from './pages/MyReportsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}