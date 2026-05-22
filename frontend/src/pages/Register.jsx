import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, getDepartments } from '../api'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:          '',
    email:         '',
    password:      '',
    department_id: '',
    year:          '',
    roll_number:   ''
  })

  const [departments, setDepartments] = useState([])
  const [loading,     setLoading    ] = useState(false)
  const [error,       setError      ] = useState('')
  const [success,     setSuccess    ] = useState('')

  // Load departments when page opens
  useEffect(() => {
    console.log('Fetching departments...')

    getDepartments()
      .then(res => {
        console.log('Got departments:', res.data)
        setDepartments(res.data)
      })
      .catch(err => {
        console.log('Error:', err)
        setError('Could not load departments. Make sure backend is running.')
      })
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (!form.department_id) {
      setError('Please select a department')
      setLoading(false)
      return
    }

    console.log('Submitting:', form)

    try {
      await registerUser(form)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.log('Error:', err.response?.data)
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-5xl">🎓</span>
          <h1 className="text-white text-3xl font-black mt-4 mb-2">Create account</h1>
          <p className="text-gray-400">Join thousands of BTech students</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Show how many departments loaded */}
          <p className="text-gray-600 text-xs mb-4">
            {departments.length} departments loaded
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ravi Kumar"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

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
                placeholder="Min 6 characters"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                Department
              </label>

              {departments.length === 0 ? (
                <div className="w-full bg-gray-800 border border-gray-700 text-gray-500 rounded-xl px-4 py-3 text-sm">
                  Loading departments...
                </div>
              ) : (
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              )}
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
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="">Year</option>
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
                  placeholder="21CS001"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || departments.length === 0}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>

          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}