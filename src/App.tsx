import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Log from '@/pages/Log'
import Earnings from '@/pages/Earnings'
import Reports from '@/pages/Reports'
import TaxEstimate from '@/pages/TaxEstimate'
import Login from '@/pages/Login'
import { useSession } from '@/hooks/useSession'

export default function App() {
  const { session, loading } = useSession()

  if (loading) return null

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log" element={<Log />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tax-estimate" element={<TaxEstimate />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
