import { Link, useNavigate } from 'react-router-dom'
import { MetricCard, StudentCard, Button } from '@treinozap/ui'
import { useStudents, useInactiveStudents } from '@hooks/useStudents'

export function DashboardPage() {
  const { students, isLoading } = useStudents()
  const { students: inactive } = useInactiveStudents(7)
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
