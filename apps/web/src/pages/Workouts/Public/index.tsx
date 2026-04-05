import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Badge } from '@treinozap/ui'
import { getWorkoutByToken, logWorkoutActivity } from '@services/workouts'
import type { WorkoutWithExercises } from '@treinozap/types'

export function PublicWorkoutPage() {
  const { token } = useParams<{ token: string }>()
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMarkingDone, setIsMarkingDone] = useState(false)

  useEffect(() => {
    if (!token) return
    getWorkoutByToken(token).then((w) => {
      setWorkout(w)
      if (w) logWorkoutActivity(w.id, w.student_id ?? null, 'viewed_workout')
    }).finally(() => setIsLoading(false))
  }, [token])

  async function handleComplete() {
    if (!workout || isCompleted) return
    setIsMarkingDone(true)
    await logWorkoutActivity(workout.id, workout.student_id ?? null, 'completed_workout')
    setIsCompleted(true)
    setIsMarkingDone(false)
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

  const sortedExercises = [...(workout.exercises ?? [])].sort((a, b) => a.order_index - b.order_index)

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
          <Badge variant="gold">{sortedExercises.length} exercícios</Badge>
          {isCompleted && <Badge variant="active" dot>Concluído hoje!</Badge>}
        </div>
      </div>

      {/* Lista de exercícios */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {sortedExercises.map((ex, i) => (
          <div key={ex.id} className="tz-card">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-tz-gold/10 flex items-center justify-center">
                <span className="text-tz-gold font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-tz-white">{ex.name}</h3>
                <div className="flex gap-4 mt-2">
                  {ex.sets && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Séries</span>
                      <p className="font-mono text-sm font-bold text-tz-electric mt-0.5">{ex.sets}x</p>
                    </div>
                  )}
                  {ex.reps && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Reps</span>
                      <p className="font-mono text-sm font-bold text-tz-white mt-0.5">{ex.reps}</p>
                    </div>
                  )}
                  {ex.rest_seconds && (
                    <div>
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">Descanso</span>
                      <p className="font-mono text-sm font-bold text-tz-muted mt-0.5">{ex.rest_seconds}s</p>
                    </div>
                  )}
                </div>
                {ex.notes && (
                  <p className="text-xs text-tz-muted mt-2 italic">💡 {ex.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA fixo */}
      <div className="sticky bottom-0 bg-tz-bg border-t border-tz-border px-5 py-4 safe-area-bottom">
        <Button
          fullWidth
          size="lg"
          variant={isCompleted ? 'gold' : 'primary'}
          onClick={handleComplete}
          isLoading={isMarkingDone}
          disabled={isCompleted}
        >
          {isCompleted ? '✓ Treino concluído!' : 'Marcar como concluído'}
        </Button>
      </div>
    </div>
  )
}
