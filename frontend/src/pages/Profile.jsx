import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDepartments } from '../api'
import axios from 'axios'

export default function Profile() {
  const { user, logout, login } = useAuth()
  const navigate                = useNavigate()

  const [editing,     setEditing    ] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loading,     setLoading    ] = useState(false)
  const [success,     setSuccess    ] = useState('')
  const [error,       setError      ] = useState('')

  const [form, setForm] = useState({
    name:          '',
    department_id: '',
    year:          '',
    roll_number:   '',
  })

  // Fill form with current user data
  useEffect(() => {
    if (user) {
      setForm({
        name:          user.name          || '',
        department_id: user.department_id || '',
        year:          user.year          || '',
        roll_number:   user.roll_number   || '',
      })
    }
  }, [user])

  // Load departments for dropdown
  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update global auth state with new data
      login(token, res.data)

      setSuccess('Profile updated successfully!')
      setEditing(false)

    } catch (err) {
      setError(err.response?.data?.error || 'Update failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      name:          user.name          || '',
      department_id: user.department_id || '',
      year:          user.year          || '',
      roll_number:   user.roll_number   || '',
    })
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-black mb-8">My Profile</h1>

        {/* Success */}
        {success && (
          <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-3 rounded-lg mb-6">
            ✅ {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">

          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
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

            {/* Edit button */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {!editing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Department',
                  value: user?.departments?.code || 'Not set'
                },
                {
                  label: 'Year',
                  value: user?.year
                    ? `${user.year}${['st','nd','rd','th'][user.year - 1]} Year`
                    : 'Not set'
                },
                {
                  label: 'Roll Number',
                  value: user?.roll_number || 'Not set'
                },
                {
                  label: 'Member Since',
                  value: user?.created_at
                    ? new Date(user.created_at).getFullYear()
                    : 'N/A'
                },
              ].map(info => (
                <div key={info.label} className="bg-gray-800 rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">{info.label}</div>
                  <div className="text-white font-semibold text-sm">{info.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT MODE */}
          {editing && (
            <div className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Department */}
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-2">
                  Department
                </label>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year and Roll Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm font-medium block mb-2">
                    Current Year
                  </label>
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm font-medium block mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="roll_number"
                    value={form.roll_number}
                    onChange={handleChange}
                    placeholder="e.g. 21CS001"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Save and Cancel buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Uploads',   value: '—', icon: '⬆️' },
            { label: 'Downloads', value: '—', icon: '⬇️' },
            { label: 'Points',    value: '—', icon: '⭐' },
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Logout from StudyVault
        </button>

      </div>
    </div>
  )
}