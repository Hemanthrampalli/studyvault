import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/browse', label: 'Material Browser', icon: 'explore' },
  { to: '/upload', label: 'Uploads', icon: 'cloud_upload' },
  { to: '/profile', label: 'Profile', icon: 'account_circle' },
]

function getFirstName(user) {
  return user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#131b2e]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-[#c3c5d9]/80 bg-white/90 backdrop-blur md:flex">
        <Link to="/dashboard" className="flex items-center gap-3 px-7 py-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0052ff] text-white shadow-lg shadow-blue-900/10">
            <span className="material-symbols-outlined icon-filled">school</span>
          </span>
          <span>
            <span className="block text-2xl font-extrabold leading-none text-[#0052ff]">StudyVault</span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-[#737688]">
              Academic Portal
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#e2e7ff] text-[#003ec7] shadow-sm'
                    : 'text-[#434656] hover:bg-[#f2f3ff] hover:text-[#003ec7]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5">
          <Link
            to={user ? '/upload' : '/login'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#003ec7] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-blue-900/10 transition hover:bg-[#0052ff]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Quick Upload
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#c3c5d9]/70 bg-[#faf8ff]/85 backdrop-blur-xl md:ml-72">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-[#0052ff] md:hidden">
            <span className="material-symbols-outlined icon-filled">school</span>
            StudyVault
          </Link>

          <div className="relative hidden w-full max-w-xl md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737688]">
              search
            </span>
            <input
              className="w-full rounded-full border-0 bg-[#f2f3ff] py-2 pl-11 pr-4 text-sm text-[#434656] outline-none ring-1 ring-transparent transition focus:ring-[#0052ff]/30"
              placeholder="Search academic resources..."
              type="search"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="rounded-full p-2 text-[#434656] transition hover:bg-[#e2e7ff]" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {user ? (
              <>
                <Link to="/profile" className="hidden items-center gap-3 border-l border-[#c3c5d9] pl-4 sm:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dde1ff] font-bold text-[#003ec7]">
                    {getFirstName(user).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[#131b2e]">{getFirstName(user)}</span>
                </Link>
                <button
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[#737688] transition hover:bg-[#e2e7ff] hover:text-[#003ec7]"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="rounded-lg bg-[#003ec7] px-4 py-2 text-sm font-bold text-white" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-[#c3c5d9]/40 px-3 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                  isActive ? 'bg-[#e2e7ff] text-[#003ec7]' : 'text-[#434656]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="md:ml-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  )
}
