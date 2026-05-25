import { useEffect, useMemo, useState } from 'react'
import { getMyUploads, getProfile, updateProfile } from '../api'
import MaterialCard from '../components/MaterialCard'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { logout, user } = useAuth()
  const [profile, setProfile] = useState(user)
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({
    profile_visible: true,
    show_academic_stats: true,
    email_notifications: true,
    direct_messages: true,
  })

  useEffect(() => {
    Promise.all([getProfile(), getMyUploads()])
      .then(([profileRes, uploadsRes]) => {
        setProfile(profileRes.data)
        setUploads(uploadsRes.data)
        setSettings((prev) => ({ ...prev, ...(profileRes.data?.settings || {}) }))
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const downloads = uploads.reduce((sum, item) => sum + Number(item.downloads || 0), 0)
    return [
      { label: 'Uploads', value: uploads.length },
      { label: 'Downloads', value: downloads },
      { label: 'Rank', value: uploads.length >= 5 ? 'Top 5%' : 'Rising' },
      { label: 'Points', value: uploads.length * 10 + downloads },
    ]
  }, [uploads])

  const saveSettings = async (nextSettings) => {
    setSettings(nextSettings)
    setSaving(true)
    setMessage('')
    try {
      await updateProfile({ settings: nextSettings })
      setMessage('Settings saved.')
    } catch {
      setMessage('Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-[#565e74]">Loading profile...</div>
  }

  return (
    <div className="space-y-8">
      <section className="academic-card relative overflow-hidden rounded-2xl p-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-[#0052ff]/10" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-6">
            <span className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white bg-[#dde1ff] text-5xl font-extrabold text-[#003ec7] shadow-xl shadow-blue-900/10">
              {(profile?.name || 'S').slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h1 className="text-4xl font-extrabold text-[#0b1c30]">{profile?.name || 'Student'}</h1>
              <p className="mt-2 text-lg text-[#565e74]">
                {profile?.departments?.name || 'Department not set'}
                {profile?.year ? `, ${profile.year} Year` : ''}
              </p>
            </div>
          </div>
          <button
            className="rounded-lg bg-[#003ec7] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-900/10"
            onClick={logout}
            type="button"
          >
            Logout
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="academic-card rounded-lg p-6">
            <h2 className="text-2xl font-extrabold text-[#0b1c30]">Personal Information</h2>
            <dl className="mt-5 space-y-4">
              {[
                ['Email Address', profile?.email || 'N/A', 'mail'],
                ['Roll Number', profile?.roll_number || 'N/A', 'badge'],
                ['Department', profile?.departments?.code || 'N/A', 'school'],
                ['Year', profile?.year ? `${profile.year} Year` : 'N/A', 'calendar_month'],
              ].map(([label, value, icon]) => (
                <div className="flex items-center gap-3" key={label}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff4ff] text-[#0052ff]">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </span>
                  <div>
                    <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#737688]">{label}</dt>
                    <dd className="font-semibold text-[#0b1c30]">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-[#e2e7ff] p-6">
            <h2 className="text-xl font-extrabold text-[#0b1c30]">Academic Statistics</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div className="rounded-lg bg-white p-4" key={stat.label}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#737688]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#003ec7]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="academic-card rounded-lg p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#0b1c30]">My Uploaded Materials</h2>
              <p className="mt-1 text-[#565e74]">Resources you contributed to StudyVault.</p>
            </div>
          </div>

          {uploads.length === 0 ? (
            <div className="rounded-lg bg-[#f2f3ff] p-10 text-center text-[#565e74]">
              No uploads yet. Use Quick Upload to contribute your first resource.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {uploads.slice(0, 4).map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="academic-card rounded-lg p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">Account Settings</h2>
          <span className="material-symbols-outlined text-[#737688]">settings</span>
        </div>
        {message && <p className="mb-4 text-sm font-semibold text-[#0052ff]">{message}</p>}
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['profile_visible', 'Profile Visibility', 'Show your profile to other students.'],
            ['show_academic_stats', 'Show Academic Stats', 'Allow others to see your contribution stats.'],
            ['email_notifications', 'Email Notifications', 'Receive weekly material updates.'],
            ['direct_messages', 'Direct Messages', 'Allow collaboration requests.'],
          ].map(([key, label, description]) => (
            <label className="flex items-center justify-between gap-4 rounded-lg bg-[#faf8ff] p-4" key={key}>
              <span>
                <span className="block font-extrabold text-[#0b1c30]">{label}</span>
                <span className="text-sm text-[#737688]">{description}</span>
              </span>
              <input
                checked={Boolean(settings[key])}
                className="h-5 w-5 accent-[#0052ff]"
                disabled={saving}
                onChange={(event) => saveSettings({ ...settings, [key]: event.target.checked })}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
