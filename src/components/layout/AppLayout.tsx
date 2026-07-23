import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  ShieldAlert,
  Landmark,
  Trophy,
  Bell,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Executive Summary', icon: LayoutDashboard, end: true },
  { to: '/klaster/Kebijakan', label: 'Klaster Kebijakan', icon: Landmark },
  { to: '/klaster/Bisnis', label: 'Klaster Bisnis', icon: Landmark },
  { to: '/klaster/Nasabah', label: 'Klaster Nasabah', icon: Landmark },
  { to: '/klaster/Risiko', label: 'Klaster Risiko', icon: ShieldAlert },
  { to: '/klaster/Industri', label: 'Klaster Industri', icon: Landmark },
  { to: '/data-berita', label: 'Data Berita', icon: Newspaper },
  { to: '/kompetitor', label: 'Kompetitor', icon: Trophy },
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell },
]

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          AI Banking Intelligence Dashboard
        </p>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Bank Syariah Indonesia
        </p>
        <nav className="flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            AI Banking Intelligence Dashboard
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bank Syariah Indonesia
          </p>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}
