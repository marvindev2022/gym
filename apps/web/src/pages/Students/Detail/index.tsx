import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Avatar, Badge, Button, WorkoutCard } from '@treinozap/ui'
import { getStudent, updateStudent } from '@services/students'
import { supabase } from '@lib/supabase'
import type { Student, WorkoutWithExercises } from '@treinozap/types'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getStudent(id),
      supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('student_id', id)
        .order('created_at', { ascending: false }),
    ]).then(([s, { data: w }]) => {
      setStudent(s)
      setWorkouts((w as WorkoutWithExercises[]) ?? [])
    }).finally(() => setIsLoading(false))
  }, [id])

  async function toggleStatus() {
    if (!student || !id) return
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    const updated = await updateStudent(id, { status: newStatus })
    setStudent(updated)
  }

  if (isLoading) return <div className="text-center py-12 text-tz-muted">Carregando...</div>
  if (!student) return <div className="text-center py-12 text-tz-error">Aluno não encontrado</div>

  const whatsappUrl = `https://wa.me/${student.phone.replace(/\D/g, '')}`
  const statusVariant = student.status === 'active' ? 'active' : student.status === 'inactive' ? 'inactive' : 'blocked'

  return (
    <div className="flex flex-col gap-6 max-w-lg animate-fade-in">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-tz-muted hover:text-tz-white text-sm transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Voltar
      </button>

      {/* Perfil */}
      <div className="tz-card flex items-start gap-4">
        <Avatar name={student.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-tz-white">{student.name}</h1>
            <Badge variant={statusVariant} dot>
              {student.status === 'active' ? 'Ativo' : student.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
            </Badge>
          </div>
          {student.goal && <p className="text-sm text-tz-muted mt-1">{student.goal}</p>}
          <div className="flex gap-3 mt-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            </a>
            <Button size="sm" variant="ghost" onClick={toggleStatus}>
              {student.status === 'active' ? 'Marcar inativo' : 'Ativar aluno'}
            </Button>
          </div>
        </div>
      </div>

      {/* Info financeira */}
      {(student.monthly_fee || student.payment_due_day) && (
        <div className="tz-card">
          <h2 className="tz-section-title mb-3">Financeiro</h2>
          <div className="flex gap-6">
            {student.monthly_fee && (
              <div>
                <span className="text-2xs text-tz-muted uppercase tracking-wide">Mensalidade</span>
                <p className="font-mono text-lg font-bold text-tz-gold mt-0.5">
                  R${student.monthly_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            {student.payment_due_day && (
              <div>
                <span className="text-2xs text-tz-muted uppercase tracking-wide">Vence dia</span>
                <p className="font-mono text-lg font-bold text-tz-white mt-0.5">{student.payment_due_day}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treinos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="tz-section-title">Treinos</h2>
          <Link to={`/workouts/new?studentId=${student.id}`}>
            <Button size="sm" variant="ghost">+ Criar treino</Button>
          </Link>
        </div>
        {workouts.length === 0 ? (
          <div className="tz-card text-center py-8">
            <p className="text-sm text-tz-muted">Nenhum treino criado ainda</p>
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
      </section>
    </div>
  )
}
