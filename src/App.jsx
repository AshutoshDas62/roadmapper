import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/roadmaps" element={<PlaceholderPage title="Roadmaps" />} />
            <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
            <Route path="/bookmarks" element={<PlaceholderPage title="Bookmarks" />} />
            <Route path="/important" element={<PlaceholderPage title="Important" />} />
            <Route path="/goals" element={<PlaceholderPage title="Goals" />} />
            <Route path="/study-sessions" element={<PlaceholderPage title="Study Sessions" />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
