import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api'
import MaterialCard from '../components/MaterialCard'
import { useAuth } from '../context/AuthContext'

const EMPTY_DASHBOARD = {
  profile: null,
  stats: { uploads: 0, downloads: 0, materials: 0, subjects: 0 },
  recentMaterials: [],
  myUploads: [],
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then((res) => setDashboard({ ...EMPTY_DASHBOARD, ...res.data }))
      .catch((err) => setError(err.response?.data?.error || 'Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const profile = dashboard.profile || user
  const firstName = profile?.name?.split(' ')[0] || 'Student'

  if (loading) {
    return <div className="py-20 text-center text-[#565e74]">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0052ff]">Academic excellence</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b1c30] sm:text-5xl">
            Welcome back, <span className="text-[#003ec7]">{firstName}</span>!
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#565e74]">
            Continue browsing, upload new resources, and keep your StudyVault contribution history in one place.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e2e7ff] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0b1c30]">
          <span className="h-2 w-2 rounded-full bg-[#9e4300]" />
          Exam season approaching
        </span>
      </section>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'My Uploads', value: dashboard.stats.uploads, icon: 'cloud_upload', hint: 'Community contributor' },
          { label: 'Total Downloads', value: dashboard.stats.downloads, icon: 'download', hint: 'Across your resources' },
          { label: 'Materials', value: dashboard.stats.materials, icon: 'library_books', hint: 'Approved repository items' },
          { label: 'Subjects', value: dashboard.stats.subjects, icon: 'menu_book', hint: 'Available in database' },
        ].map((stat) => (
          <div key={stat.label} className="academic-card rounded-lg p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#dde1ff] text-[#003ec7]">
                <span className="material-symbols-outlined text-[34px]">{stat.icon}</span>
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#737688]">{stat.label}</p>
                <p className="mt-1 text-4xl font-extrabold text-[#0b1c30]">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#0052ff]">{stat.hint}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="rounded-lg bg-[#0052ff] p-8 text-white shadow-2xl shadow-blue-900/10">
          <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em]">
            Resume learning
          </span>
          <h2 className="mt-8 max-w-2xl text-4xl font-extrabold leading-tight">
            Browse curated resources for your current semester.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">
            Filter by department, year, semester, subject, and resource type.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-white px-6 py-3 font-extrabold text-[#003ec7]" to="/browse">
              Open Material Browser
            </Link>
            <Link className="rounded-lg border border-white/40 px-6 py-3 font-extrabold text-white" to="/upload">
              Upload Resource
            </Link>
          </div>
        </div>

        <div className="academic-card rounded-lg p-6">
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">Your Next Milestone</h2>
          <p className="mt-3 text-sm leading-6 text-[#565e74]">
            Share {Math.max(0, 3 - Number(dashboard.stats.uploads || 0))} more resources to level up your contributor rank.
          </p>
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-[#737688]">
              <span>Progress</span>
              <span>{Math.min(100, Number(dashboard.stats.uploads || 0) * 34)}%</span>
            </div>
            <div className="h-3 rounded-full bg-[#e2e7ff]">
              <div
                className="h-3 rounded-full bg-[#4648d4]"
                style={{ width: `${Math.min(100, Number(dashboard.stats.uploads || 0) * 34)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0b1c30]">Recent Community Uploads</h2>
            <p className="mt-1 text-[#565e74]">Newest approved materials from Supabase.</p>
          </div>
          <Link className="font-extrabold text-[#0052ff]" to="/browse">
            View all
          </Link>
        </div>

        {dashboard.recentMaterials.length === 0 ? (
          <div className="academic-card rounded-lg p-10 text-center text-[#565e74]">
            No approved materials yet. Upload the first resource for your class.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.recentMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
