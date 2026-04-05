import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, StudentCard } from '@treinozap/ui'
import { useStudents } from '@hooks/useStudents'
import { buildActivationMessage } from '@services/notifications'
import { supabase } from '@lib/supabase'
import type { StudentStatus } from '@treinozap/types'

const statusOptions: { value: 'all' | StudentStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'blocked', label: 'Bloqueados' },
]

export function StudentsListPage() {
  const { students, isLoading } = useStudents()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all')
  const [trainerName, setTrainerName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('trainers').select('name').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setTrainerName(data.name) })
    })
  }, [])

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tz-white">Alunos</h1>
          <p className="text-sm text-tz-muted mt-0.5">{students.length} cadastrado(s)</p>
        </div>
        <Link to="/students/new"><Button size="sm">+ Novo aluno</Button></Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <input
          type="search"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-h-[48px] rounded-tz-sm bg-tz-surface border border-tz-border px-4 text-sm text-tz-white placeholder:text-tz-muted focus:outline-none focus:border-tz-gold transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-tz-gold text-tz-bg'
                  : 'bg-tz-surface border border-tz-border text-tz-muted hover:text-tz-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-tz-muted text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="tz-card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-tz-muted text-sm">Nenhum aluno encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((student) => (
            <StudentCard
              key={student.id}
              {...student}
              lastActivityAt={student.last_activity_at}
              whatsappMessage={
                student.status === 'pending'
                  ? buildActivationMessage({
                      studentName: student.name,
                      trainerName,
                      email: student.email,
                      portalUrl: student.student_token
                        ? `${window.location.origin}/aluno/${student.student_token}`
                        : window.location.origin,
                    })
                  : undefined
              }
              onClick={() => navigate(`/students/${student.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
