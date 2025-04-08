import Admin from '@/components/admin/Admin'
import { ProtectedRoute } from '@/components/auth/protected-route'
import Dashboard from '@/pages/dashboard'
import DocumentUpload from '@/pages/document-upload'
import LoginPage from '@/pages/login-page'
import OTPVerificationPage from '@/pages/otp-verification-page'
import RegisterPage from '@/pages/register-page'
import VerificationRequiredPage from '@/pages/verification-required-page'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp/:userId" element={<OTPVerificationPage />} />
        <Route
          path="/verification-required"
          element={<VerificationRequiredPage />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-upload"
          element={
            <ProtectedRoute>
              <DocumentUpload />
            </ProtectedRoute>
          }
        />

        {/* Admin-only protected route */}
        <Route
          path="/admin-page"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
