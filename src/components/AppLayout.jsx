import { Bookmark, CalendarDays, ChevronRight, CircleDot, Flag, LayoutDashboard, LogOut, Map, Timer, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Roadmaps', to: '/roadmaps', icon: Map },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
  { label: 'Important', to: '/important', icon: Flag },
  { label: 'Goals', to: '/goals', icon: CircleDot },
  { label: 'Study Sessions', to: '/study-sessions', icon: Timer },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const displayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email

  async function handleLogout() {
    try {
      setLogoutError('')
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'We could not sign you out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5 lg:h-20">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">R</span>
            Roadmapper
          </NavLink>
          <span className="text-xs font-medium text-slate-400 lg:hidden">Menu</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-slate-100 p-3 lg:mt-auto lg:block">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{displayName?.charAt(0)?.toUpperCase()}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            <LogOut size={17} aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>
      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {logoutError && <p className="mb-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{logoutError}</p>}
          <div className="mb-6 flex items-center justify-end lg:hidden">
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">Log out <ChevronRight size={16} aria-hidden="true" /></button>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
