// Navbar.jsx
// Shows at the top of every page
// Changes based on whether user is logged in or not

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')  // redirect to home after logout
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-white font-bold text-xl">StudyVault</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4">
          <Link
            to="/browse"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Browse
          </Link>

          {user ? (
            // Logged in — show profile and logout
            <>
              <Link
                to="/profile"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {/* Show first name only */}
                👤 {user.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            // Not logged in — show login and register
            <>
              <Link
                to="/login"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}