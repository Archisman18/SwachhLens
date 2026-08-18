import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ReportPage from './pages/ReportPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import MyReportsPage from './pages/MyReportsPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportPage />} />
        <Route path="/confirmation/:id" element={<ConfirmationPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
      </Routes>
    </BrowserRouter>
  )
}