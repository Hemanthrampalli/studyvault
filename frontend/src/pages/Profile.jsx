import { useState, useEffect } from 'react'
import { getMyUploads, getProfile } from '../api'
import Material from '../components/Material'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in (but ProtectedRoute should handle this)
    if (!user) {
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        
        // Get user profile
        const profileRes = await getProfile()
        setProfile(profileRes.data)

        // Get user's uploads
        const uploadsRes = await getMyUploads()
        setUploads(uploadsRes.data)
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
          <p className="text-gray-400 mb-4">
            📧 {profile?.email}
          </p>
          {profile?.roll_number && (
            <p className="text-gray-400 mb-4">
              🎓 Roll: {profile.roll_number}
            </p>
          )}
          <div className="text-sm text-teal-400">
            ✓ {uploads.length} materials uploaded
          </div>
        </div>

        {/* My Uploads Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Uploads</h2>
          
          {uploads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploads.map(material => (
                <Material key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-4">You haven't uploaded any materials yet</p>
              <p className="text-gray-500 text-sm">
                Go to Browse → Select Subject → Click "Upload Material" to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}