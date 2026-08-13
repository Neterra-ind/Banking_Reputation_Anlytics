import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  Landmark,
  Megaphone,
  Trophy,
  Bell,
} from 'lucide-react'

const NAV_ITEMS: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  activePaths?: string[]
}[] = [
  { to: '/', label: 'Executive Summary', icon: LayoutDashboard, end: true },
  { to: '/isu/BSI', label: 'Banking & BSI Issues', icon: Landmark, activePaths: ['/isu/Perbankan'] },
  { to: '/data-berita', label: 'News Data', icon: Newspaper },
  { to: '/brand-perception', label: 'Complain Mapping', icon: Megaphone },
  { to: '/kompetitor', label: 'Competitor', icon: Trophy },
  { to: '/notifikasi', label: 'Notifications', icon: Bell },
]

function isNavItemActive(pathname: string, item: (typeof NAV_ITEMS)[number]) {
  if (item.end) return pathname === item.to
  if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return true
  return item.activePaths?.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? false
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <img src={`${import.meta.env.BASE_URL}bsi-logo.png`} alt="Logo BSI" className="h-9 w-9 object-contain" />
      <div>
        <p
          className="text-xs font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Reputation Banking Analytics
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Bank Syariah Indonesia</p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 md:flex-row">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <div className="mb-3">
          <Brand />
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                isNavItemActive(location.pathname, item)
                  ? 'bg-brand-navy-50 text-brand-navy-700 dark:bg-brand-navy-500/10 dark:text-brand-navy-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="mb-8">
          <Brand />
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isNavItemActive(location.pathname, item)
                  ? 'bg-brand-navy-50 text-brand-navy-700 dark:bg-brand-navy-500/10 dark:text-brand-navy-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:pb-16">
        <Outlet />
      </main>

      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Powered by</span>
        <img
          src={`${import.meta.env.BASE_URL}neterra-logo.png`}
          alt="Logo Neterra Indonesia"
          className="h-9 w-auto object-contain"
        />
      </div>
    </div>
  )
}
