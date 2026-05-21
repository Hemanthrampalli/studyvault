// Profile.jsx
// Shows logged in user's info and their upload history
// Protected route — must be logged in

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMaterials, getSubjects } from '../api'

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now show a placeholder — 
    // In a future step we'll add GET /api/materials/my-uploads endpoint
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-black mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">

            {/* Avatar */}
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center text-3xl">
              🎓
            </div>

            <div>
              <h2 className="text-xl font-bold">{user?.name || 'Student'}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-md mt-1 inline-block capitalize">
                {user?.role || 'student'}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Department', value: user?.departments?.code || 'N/A' },
              { label: 'Year',       value: user?.year ? `${user.year} Year` : 'N/A' },
              { label: 'Roll No',    value: user?.roll_number || 'N/A' },
              { label: 'Member Since', value: new Date(user?.created_at).getFullYear() || 'N/A' },
            ].map(info => (
              <div key={info.label} className="bg-gray-800 rounded-xl p-3">
                <div className="text-gray-500 text-xs mb-1">{info.label}</div>
                <div className="text-white font-semibold text-sm">{info.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Uploads',   value: uploads.length, icon: '⬆️' },
            { label: 'Downloads', value: '—',            icon: '⬇️' },
            { label: 'Points',    value: uploads.length * 10, icon: '⭐' },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-teal-400">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Logout from StudyVault
        </button>

      </div>
    </div>
  )
}