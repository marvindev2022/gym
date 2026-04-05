import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/auth'
import { usePushNotifications } from '@hooks/usePushNotifications'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/students',
    label: 'Alunos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    to: '/workouts',
    label: 'Treinos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11M3 6.5h.01M3 12h.01M3 17.5h.01"/>
      </svg>
    ),
  },
  {
    to: '/perfil',
    label: 'Perfil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
]

export function AppLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { status: pushStatus, subscribe } = usePushNotifications()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-[100dvh] bg-tz-bg">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 flex-col border-r border-tz-border bg-tz-surface">
        <div className="flex items-center gap-2 px-5 py-6 border-b border-tz-border">
          <div className="h-8 w-8 rounded-tz-sm bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-sm">TZ</span>
          </div>
          <span className="font-bold text-tz-white text-lg tracking-tight">TreinoZap</span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-tz-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-tz-gold/10 text-tz-gold'
                    : 'text-tz-muted hover:text-tz-white hover:bg-tz-surface-2'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 flex flex-col gap-1">
          {pushStatus === 'default' && (
            <button
              onClick={subscribe}
              className="flex w-full items-center gap-3 rounded-tz-sm px-3 py-2.5 text-sm font-medium text-tz-gold hover:bg-tz-gold/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              Ativar notificações
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-tz-sm px-3 py-2.5 text-sm font-medium text-tz-muted hover:text-tz-error hover:bg-tz-error/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden flex border-t border-tz-border bg-tz-surface safe-area-bottom">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-tz-gold' : 'text-tz-muted'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-tz-muted transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sair
          </button>
        </nav>
      </div>
    </div>
  )
}
