import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@treinozap/ui'
import { getWorkoutByToken, logWorkoutActivity, updateWorkoutStatus } from '@services/workouts'
import type { WorkoutWithExercises } from '@treinozap/types'

export function PublicWorkoutPage() {
  const { token } = useParams<{ token: string }>()
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!token) return
    getWorkoutByToken(token).then((w) => {
      setWorkout(w)
      if (!w) return

      logWorkoutActivity(w.id, (w as any).student_id ?? null, 'viewed_workout')

      const status = (w as any).status ?? 'active'

      if (status === 'completed') {
        setIsCompleted(true)
      } else {
        // Primeira abertura ou retorno → marca in_progress
        // token da URL == public_token do banco
        updateWorkoutStatus(w.id, token, 'in_progress')
      }
    }).finally(() => setIsLoading(false))
  }, [token])

  function toggleExercise(id: string, total: number) {
    if (isCompleted || !workout) return
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (next.size === total) {
          setIsCompleted(true)
          updateWorkoutStatus(workout.id, token!, 'completed')
          logWorkoutActivity(workout.id, (workout as any).student_id ?? null, 'completed_workout')
        }
      }
      return next
    })
  }

  function refazerTreino() {
    if (!workout) return
    setIsCompleted(false)
    setChecked(new Set())
    updateWorkoutStatus(workout.id, token!, 'in_progress')
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">😕</span>
        <h1 className="text-xl font-bold text-tz-white">Treino não encontrado</h1>
        <p className="text-sm text-tz-muted">O link pode estar incorreto ou o treino foi desativado.</p>
      </div>
    )
  }

  const sortedExercises = [...(workout.exercises ?? [])].sort((a, b) => (a as any).order_index - (b as any).order_index)
  const total = sortedExercises.length
  const doneCount = isCompleted ? total : checked.size
  const progress = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-tz-border px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xs">TZ</span>
          </div>
          <span className="text-xs text-tz-muted font-medium">TreinoZap</span>
        </div>
        <h1 className="text-2xl font-extrabold text-tz-white leading-tight">{workout.title}</h1>
        {workout.description && (
          <p className="text-sm text-tz-muted mt-2">{workout.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <Badge variant="gold">{total} exercício{total !== 1 ? 's' : ''}</Badge>
          {isCompleted
            ? <Badge variant="active" dot>Concluído!</Badge>
            : doneCount > 0
              ? <Badge variant="pending" dot>{doneCount}/{total} feitos</Badge>
              : null
          }
        </div>

        {/* Barra de progresso */}
        <div className="mt-4 h-1.5 w-full bg-tz-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: isCompleted ? 'var(--tz-gold)' : 'var(--tz-electric)',
            }}
          />
        </div>
        <p className="text-xs text-tz-muted mt-1 text-right">{Math.round(progress)}%</p>
      </div>

      {/* Lista de exercícios */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-3 pb-28">
        {sortedExercises.map((ex, i) => {
          const isDone = isCompleted || checked.has(ex.id)
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => toggleExercise(ex.id, total)}
              disabled={isCompleted}
              className={`w-full text-left tz-card p-4 flex items-start gap-3 transition-all ${
                isCompleted ? 'opacity-70' : 'active:scale-[0.98]'
              } ${isDone ? 'border-tz-gold/40 bg-tz-gold/5' : 'hover:border-tz-border/80'}`}
            >
              <div className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                isDone ? 'bg-tz-gold border-tz-gold' : 'border-tz-border bg-transparent'
              }`}>
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-tz-bg">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold leading-snug transition-colors ${isDone ? 'text-tz-gold line-through decoration-tz-gold/40' : 'text-tz-white'}`}>
                  <span className="text-tz-muted font-normal mr-1">{i + 1}.</span>
                  {ex.name}
                </h3>
                <div className="flex gap-4 mt-2">
                  {ex.sets && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Séries</span>
                      <p className={`font-mono text-sm font-bold mt-0.5 ${isDone ? 'text-tz-muted' : 'text-tz-electric'}`}>{ex.sets}x</p>
                    </div>
                  )}
                  {ex.reps && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Reps</span>
                      <p className={`font-mono text-sm font-bold mt-0.5 ${isDone ? 'text-tz-muted' : 'text-tz-white'}`}>{ex.reps}</p>
                    </div>
                  )}
                  {(ex as any).rest_seconds && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Descanso</span>
                      <p className="font-mono text-sm font-bold text-tz-muted mt-0.5">{(ex as any).rest_seconds}s</p>
                    </div>
                  )}
                </div>
                {ex.notes && (
                  <p className="text-xs text-tz-muted mt-2 italic">💡 {ex.notes}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-tz-bg border-t border-tz-border px-5 py-4">
        {isCompleted ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-tz-gold font-bold text-lg">🏆 Treino concluído!</p>
              <p className="text-xs text-tz-muted">Seu professor já pode ver seu progresso.</p>
            </div>
            <button
              onClick={refazerTreino}
              className="text-xs text-tz-muted hover:text-tz-white underline underline-offset-2 transition-colors active:scale-95"
            >
              Refazer treino
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-tz-muted">
            Toque em cada exercício para marcar como feito
          </p>
        )}
      </div>
    </div>
  )
}
