import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage.jsx'
import ComplaintDetailPage from './pages/ComplaintDetailPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/complaint/:id" element={<ComplaintDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
