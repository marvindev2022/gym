import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Badge, Avatar } from '@treinozap/ui'
import { logWorkoutActivity } from '@services/workouts'
import type { Student, WorkoutWithExercises } from '@treinozap/types'

export function AlunoPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekCount, setWeekCount] = useState(0)

  useEffect(() => {
    if (!token) return

    async function load() {
      // Busca aluno pelo student_token
      const { data: s } = await supabase
        .from('students')
        .select('*')
        .eq('student_token', token)
        .single()

      if (!s) { setIsLoading(false); return }
      setStudent(s as Student)

      // Busca treinos do aluno
      const { data: w } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('student_id', s.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setWorkouts((w as WorkoutWithExercises[]) ?? [])

      // Conta treinos concluídos esta semana
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', s.id)
        .eq('event', 'completed_workout')
        .gte('created_at', weekStart.toISOString())

      setWeekCount(count ?? 0)
      setIsLoading(false)
    }

    load()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">😕</span>
        <h1 className="text-xl font-bold text-tz-white">Página não encontrada</h1>
        <p className="text-sm text-tz-muted">Verifique o link com seu professor.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-tz-border">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-6 w-6 rounded bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xs">TZ</span>
          </div>
          <span className="text-xs text-tz-muted font-medium">TreinoZap</span>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-tz-white">{student.name}</h1>
            {student.goal && (
              <p className="text-sm text-tz-muted mt-0.5">{student.goal}</p>
            )}
            <Badge variant="active" dot className="mt-2">Ativo</Badge>
          </div>
        </div>

        {/* Stat semanal */}
        <div className="mt-5 rounded-tz bg-tz-surface-2 border border-tz-border px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-xs text-tz-muted">Treinos concluídos essa semana</p>
            <p className="font-mono text-2xl font-bold text-tz-electric">{weekCount}</p>
          </div>
        </div>
      </div>

      {/* Treinos */}
      <div className="flex-1 px-5 py-5">
        <h2 className="tz-section-title mb-4">Meus treinos</h2>

        {workouts.length === 0 ? (
          <div className="tz-card flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🏋️</span>
            <p className="text-tz-muted text-sm">Nenhum treino disponível ainda.</p>
            <p className="text-xs text-tz-muted">Seu professor vai adicionar em breve!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workouts.map((workout) => {
              const exerciseCount = workout.exercises?.length ?? 0
              return (
                <button
                  key={workout.id}
                  onClick={() => navigate(`/t/${workout.public_token}`)}
                  className="tz-card w-full text-left hover:border-tz-gold/40 transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-tz-white truncate">{workout.title}</h3>
                      {workout.description && (
                        <p className="text-xs text-tz-muted mt-1 line-clamp-2">{workout.description}</p>
                      )}
                    </div>
                    <svg className="text-tz-muted shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Exercícios</span>
                      <p className="font-mono text-sm font-bold text-tz-electric mt-0.5">{exerciseCount}</p>
                    </div>
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Criado em</span>
                      <p className="text-xs text-tz-white mt-0.5">
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(workout.created_at))}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-5 pb-6 text-center flex flex-col gap-2">
        <p className="text-xs text-tz-muted">
          Powered by <span className="text-tz-gold font-medium">TreinoZap</span>
        </p>
        <a href="/aluno/login" className="text-xs text-tz-muted underline underline-offset-2 hover:text-tz-white transition-colors">
          Acessar com meu email
        </a>
      </div>
    </div>
  )
}
