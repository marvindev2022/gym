import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/auth'
import { usePushNotifications } from '@hooks/usePushNotifications'
import { supabase } from '@lib/supabase'

type ChatToast = { conversationId: string; senderName: string; content: string }

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
  const { signOut, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { status: pushStatus, isSubscribing, subscribeError, subscribeSuccess, subscribe } = usePushNotifications()

  const myId = session?.user.id

  // Guarda location atual sem re-criar o subscription a cada mudança de rota
  const locationRef = useRef(location)
  useEffect(() => { locationRef.current = location }, [location])

  // Cache: conversationId → nome do aluno
  const convNamesRef = useRef<Map<string, string>>(new Map())

  const [toast, setToast] = useState<ChatToast | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  // Carrega conversas e subscreve cada uma individualmente (filtro explícito é mais confiável com RLS)
  useEffect(() => {
    if (!myId) return

    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase
      .from('conversations')
      .select('id, students(name)')
      .then(({ data }) => {
        if (!data || data.length === 0) return

        data.forEach((c: any) => {
          if (c.students?.name) convNamesRef.current.set(c.id, c.students.name)
        })

        channel = supabase.channel('global_new_messages')

        for (const conv of data) {
          const convId = conv.id
          const senderName = (conv as any).students?.name ?? 'Aluno'

          channel.on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${convId}`,
          }, (payload) => {
            const msg = payload.new as any
            if (msg.sender_id === myId) return
            if (locationRef.current.pathname === `/chat/${convId}`) return

            if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
            setToast({ conversationId: convId, senderName, content: msg.content })
            toastTimerRef.current = window.setTimeout(() => setToast(null), 5000)
          })
        }

        channel.subscribe()
      })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [myId])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-[100dvh] bg-tz-bg">
      {/* Toast de nova mensagem */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-tz-surface border border-tz-border rounded-tz shadow-xl p-3 flex items-center gap-3 w-[300px] animate-fade-in">
          <div className="h-9 w-9 rounded-full bg-tz-electric/10 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tz-electric">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-tz-white">{toast.senderName}</p>
            <p className="text-xs text-tz-muted truncate mt-0.5">{toast.content}</p>
          </div>
          <button
            onClick={() => { navigate(`/chat/${toast.conversationId}`); setToast(null) }}
            className="text-tz-electric text-xs font-bold shrink-0 hover:text-tz-electric/80 transition-colors"
          >
            Ver
          </button>
        </div>
      )}

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
          {(pushStatus === 'default' || subscribeSuccess || subscribeError) && (
            <div className="flex flex-col gap-1">
              {subscribeError && (
                <p className="text-xs text-tz-error px-3">{subscribeError}</p>
              )}
              {subscribeSuccess && (
                <p className="text-xs text-green-400 px-3">✓ Notificações ativadas!</p>
              )}
              {pushStatus === 'default' && (
                <button
                  onClick={subscribe}
                  disabled={isSubscribing}
                  className="flex w-full items-center gap-3 rounded-tz-sm px-3 py-2.5 text-sm font-medium text-tz-gold hover:bg-tz-gold/10 transition-colors disabled:opacity-60"
                >
                  {isSubscribing ? (
                    <div className="h-4 w-4 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                  )}
                  {isSubscribing ? 'Ativando...' : 'Ativar notificações'}
                </button>
              )}
            </div>
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
