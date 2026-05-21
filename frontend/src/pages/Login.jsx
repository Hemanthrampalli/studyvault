// Login.jsx
// Handles user login
// On success → saves token → redirects to browse page

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  // Form state — tracks what user types
  const [form, setForm] = useState({ email: '', password: '' })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error,   setError  ] = useState('')

  // Called on every keystroke
  // Updates only the field that changed, keeps others the same
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()  // stop page from refreshing on form submit
    setLoading(true)
    setError('')

    try {
      const res = await loginUser(form)

      // Save token and user to global auth state
      login(res.data.token, res.data.user.profile)

      // Redirect to browse page
      navigate('/browse')

    } catch (err) {
      // err.response.data.error is the message from our backend
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🎓</span>
          <h1 className="text-white text-3xl font-black mt-4 mb-2">Welcome back</h1>
          <p className="text-gray-400">Login to access study materials</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>

          </form>

          {/* Register link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}