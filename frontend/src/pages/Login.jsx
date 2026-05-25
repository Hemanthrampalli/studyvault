import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await loginUser(form)
      login(res.data.token, res.data.user.profile)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f8f9ff] lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#0b1c30] text-white lg:block">
        <img
          alt="Academic library"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1c30]/65 via-[#0b1c30]/70 to-[#0b1c30]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link className="flex items-center gap-3 text-3xl font-extrabold" to="/browse">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#0052ff]">
              <span className="material-symbols-outlined icon-filled">school</span>
            </span>
            StudyVault
          </Link>
          <div className="max-w-xl">
            <h1 className="text-6xl font-extrabold leading-tight">Welcome to your Academic Portal.</h1>
            <p className="mt-6 text-xl leading-8 text-white/80">
              Access curated materials, upload resources, and keep your study workflow organized.
            </p>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">Built for student collaboration</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-10">
            <Link className="mb-10 inline-flex items-center gap-2 font-extrabold text-[#0052ff] lg:hidden" to="/browse">
              <span className="material-symbols-outlined icon-filled">school</span>
              StudyVault
            </Link>
            <h2 className="text-5xl font-extrabold text-[#0b1c30]">Sign in</h2>
            <p className="mt-4 text-lg text-[#565e74]">Continue your academic journey.</p>
          </div>

          <div className="rounded-lg bg-[#eff4ff] p-1">
            <Link className="inline-flex w-1/2 justify-center rounded-lg bg-[#0052ff] px-4 py-3 text-sm font-extrabold text-white" to="/login">
              Login
            </Link>
            <Link className="inline-flex w-1/2 justify-center rounded-lg px-4 py-3 text-sm font-extrabold text-[#565e74]" to="/register">
              Register
            </Link>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
                Email Address
              </span>
              <input
                className="h-12 w-full rounded-lg border border-[#c1c6d6] bg-white px-4 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                name="email"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@college.edu"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#565e74]">
                Password
              </span>
              <input
                className="h-12 w-full rounded-lg border border-[#c1c6d6] bg-white px-4 outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
                name="password"
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Enter your password"
                required
                type="password"
                value={form.password}
              />
            </label>

            <button
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#005bbf] font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#0052ff] disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in...' : 'Log in to dashboard'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-[#737688]">
            New here?{' '}
            <Link className="font-extrabold text-[#0052ff]" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
