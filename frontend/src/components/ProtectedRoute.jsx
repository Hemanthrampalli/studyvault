// ProtectedRoute.jsx
// Wraps pages that require login
// If not logged in → redirects to /login automatically
// If logged in → shows the page normally

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Still checking login status — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in → show the actual page
  return children
}