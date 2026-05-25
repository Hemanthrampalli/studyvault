import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDepartments, registerUser } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department_id: '',
    year: '',
    roll_number: '',
  })
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Could not load departments. Please start the backend and check Supabase settings.'))
      .finally(() => setLoadingDepartments(false))
  }, [])

  const updateField = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await registerUser(form)
      setSuccess('Account created. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl shadow-blue-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#0b1c30] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link className="flex items-center gap-3 text-2xl font-extrabold" to="/browse">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0052ff]">
              <span className="material-symbols-outlined icon-filled">school</span>
            </span>
            StudyVault
          </Link>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#adc7ff]">Student project ready</p>
            <h1 className="text-5xl font-extrabold leading-tight">Create a resource-sharing account.</h1>
            <p className="mt-5 text-lg leading-8 text-white/75">
              Department, year, and roll number help organize resources for the right students.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {['Auth', 'DB', 'Storage'].map((item) => (
              <div key={item} className="rounded-lg bg-white/10 p-4 font-bold">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0b1c30]">Register</h2>
              <p className="mt-2 text-[#565e74]">Join your college material repository.</p>
            </div>
            <Link className="rounded-lg border border-[#c1c6d6] px-4 py-2 text-sm font-bold text-[#0052ff]" to="/login">
              Login
            </Link>
          </div>

          {(error || success) && (
            <div
              className={`mb-5 rounded-lg px-4 py-3 text-sm font-semibold ${
                error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || success}
            </div>
          )}

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                Full Name
              </span>
              <input
                className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                name="name"
                onChange={updateField}
                placeholder="Alex Johnson"
                required
                value={form.name}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Academic Email
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="email"
                  onChange={updateField}
                  placeholder="you@college.edu"
                  required
                  type="email"
                  value={form.email}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Password
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="password"
                  onChange={updateField}
                  placeholder="Min 6 characters"
                  required
                  type="password"
                  value={form.password}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                Department
              </span>
              <select
                className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                disabled={loadingDepartments}
                name="department_id"
                onChange={updateField}
                required
                value={form.department_id}
              >
                <option value="">{loadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Current Year
                </span>
                <select
                  className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="year"
                  onChange={updateField}
                  required
                  value={form.year}
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#565e74]">
                  Roll Number
                </span>
                <input
                  className="h-12 w-full rounded-lg border border-[#c1c6d6] px-4 outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                  name="roll_number"
                  onChange={updateField}
                  placeholder="21CS001"
                  value={form.roll_number}
                />
              </label>
            </div>

            <button
              className="mt-2 h-12 rounded-lg bg-[#003ec7] font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0052ff] disabled:opacity-60"
              disabled={loading || loadingDepartments}
              type="submit"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
