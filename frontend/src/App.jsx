import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Browse from './pages/Browse'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MaterialDetail from './pages/MaterialDetail'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Subject from './pages/Subject'
import UploadMaterial from './pages/UploadMaterial'

function ShellRoute({ children }) {
  return <AppShell>{children}</AppShell>
}

function ProtectedShellRoute({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedShellRoute>
                <Dashboard />
              </ProtectedShellRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ShellRoute>
                <Browse />
              </ShellRoute>
            }
          />
          <Route
            path="/subject/:subject_id"
            element={
              <ShellRoute>
                <Subject />
              </ShellRoute>
            }
          />
          <Route
            path="/materials/:id"
            element={
              <ShellRoute>
                <MaterialDetail />
              </ShellRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedShellRoute>
                <UploadMaterial />
              </ProtectedShellRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedShellRoute>
                <Profile />
              </ProtectedShellRoute>
            }
          />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
