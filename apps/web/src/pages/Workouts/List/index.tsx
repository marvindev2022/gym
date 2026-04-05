import { Link } from 'react-router-dom'
import { Button, WorkoutCard } from '@treinozap/ui'
import { useWorkouts } from '@hooks/useWorkouts'

export function WorkoutsListPage() {
  const { workouts, isLoading } = useWorkouts()

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tz-white">Treinos</h1>
          <p className="text-sm text-tz-muted mt-0.5">{workouts.length} treino(s) criado(s)</p>
        </div>
        <Link to="/workouts/new"><Button size="sm">+ Novo treino</Button></Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-tz-muted text-sm">Carregando...</div>
      ) : workouts.length === 0 ? (
        <div className="tz-card flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-4xl">💪</span>
          <div>
            <p className="font-medium text-tz-white">Nenhum treino criado</p>
            <p className="text-sm text-tz-muted mt-1">Crie seu primeiro treino e compartilhe com um aluno</p>
          </div>
          <Link to="/workouts/new"><Button size="sm">+ Criar treino</Button></Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              {...w}
              publicToken={w.public_token}
              exercisesCount={w.exercises?.length ?? 0}
              isActive={w.is_active}
              createdAt={w.created_at}
            />
          ))}
        </div>
      )}
    </div>
  )
}
