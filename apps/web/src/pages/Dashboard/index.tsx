import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MetricCard, StudentCard, Button } from '@treinozap/ui'
import { useStudents, useInactiveStudents } from '@hooks/useStudents'
import { supabase } from '@lib/supabase'

type PendingRequest = {
  id: string
  message: string | null
  created_at: string
  students: { id: string; name: string; goal: string | null; email: string | null }
}

function usePendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!trainer) return

    const { data } = await supabase
      .from('trainer_requests')
      .select('id, message, created_at, students(id, name, goal, email)')
      .eq('trainer_id', trainer.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setRequests((data as PendingRequest[]) ?? [])
    setIsLoading(false)
  }

  async function accept(requestId: string, studentId: string, trainerId: string) {
    // Aceita a solicitação e vincula o aluno ao trainer
    await Promise.all([
      supabase.from('trainer_requests').update({ status: 'accepted' }).eq('id', requestId),
      supabase.from('students').update({ trainer_id: trainerId }).eq('id', studentId),
    ])
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  async function reject(requestId: string) {
    await supabase.from('trainer_requests').update({ status: 'rejected' }).eq('id', requestId)
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  useEffect(() => {
    load()

    // Real-time: atualiza quando chega nova solicitação
    const channel = supabase
      .channel('trainer_requests_notify')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trainer_requests',
      }, () => { load() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { requests, isLoading, accept, reject }
}

export function DashboardPage() {
  const { students, isLoading } = useStudents()
  const { students: inactive } = useInactiveStudents(7)
  const { requests, accept, reject } = usePendingRequests()
  const navigate = useNavigate()

  const activeCount = students.filter((s) => s.status === 'active').length
  const estimatedRevenue = students
    .filter((s) => s.status === 'active' && s.monthly_fee)
    .reduce((acc, s) => acc + (s.monthly_fee ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tz-white">Dashboard</h1>
          <p className="text-sm text-tz-muted mt-0.5">Visão geral da sua academia</p>
        </div>
        <Link to="/students/new">
          <Button size="sm">+ Novo aluno</Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total de alunos"
          value={isLoading ? '—' : students.length}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
          variant="gold"
        />
        <MetricCard
          title="Ativos"
          value={isLoading ? '—' : activeCount}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
          variant="electric"
        />
        <MetricCard
          title="Inativos 7d"
          value={inactive.length}
          subtitle="precisam de atenção"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
          variant={inactive.length > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          title="Receita/mês"
          value={`R$${estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          subtitle="estimada (ativos)"
          variant="gold"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          }
        />
      </div>

      {/* Solicitações pendentes de alunos */}
      {requests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="tz-section-title">Solicitações de alunos</h2>
            <span className="h-5 w-5 rounded-full bg-tz-electric text-tz-bg text-2xs font-bold flex items-center justify-center">
              {requests.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {requests.map((req) => (
              <div key={req.id} className="tz-card flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-tz-electric/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-tz-electric">
                    {req.students.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-tz-white">{req.students.name}</p>
                  {req.students.goal && (
                    <p className="text-xs text-tz-muted truncate">Objetivo: {req.students.goal}</p>
                  )}
                  {req.message && (
                    <p className="text-xs text-tz-muted mt-1 italic">"{req.message}"</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const { data: trainer } = await supabase.from('trainers').select('id').eq('user_id', (await supabase.auth.getUser()).data.user!.id).single()
                        accept(req.id, req.students.id, trainer!.id)
                      }}
                    >
                      Aceitar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => reject(req.id)}>
                      Recusar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alertas de inatividade */}
      {inactive.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="tz-section-title">Alunos inativos há +7 dias</h2>
            <Link to="/students" className="text-xs text-tz-gold hover:text-tz-gold-light transition-colors">
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {inactive.slice(0, 3).map((student) => (
              <StudentCard
                key={student.id}
                {...student}
                lastActivityAt={student.last_activity_at}
                onClick={() => navigate(`/students/${student.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Últimos alunos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="tz-section-title">Alunos recentes</h2>
          <Link to="/students" className="text-xs text-tz-gold hover:text-tz-gold-light transition-colors">
            Ver todos
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-tz-muted text-sm">Carregando...</div>
        ) : students.length === 0 ? (
          <div className="tz-card flex flex-col items-center gap-4 py-12 text-center">
            <span className="text-4xl">🏋️</span>
            <div>
              <p className="font-medium text-tz-white">Nenhum aluno cadastrado</p>
              <p className="text-sm text-tz-muted mt-1">Adicione seu primeiro aluno para começar</p>
            </div>
            <Link to="/students/new"><Button size="sm">+ Adicionar aluno</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {students.slice(0, 5).map((student) => (
              <StudentCard
                key={student.id}
                {...student}
                lastActivityAt={student.last_activity_at}
                onClick={() => navigate(`/students/${student.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
