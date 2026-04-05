import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Badge, Avatar } from '@treinozap/ui'
import { useAuth } from '@contexts/auth'
import type { Student, WorkoutWithExercises } from '@treinozap/types'

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export function AlunoPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekCount, setWeekCount] = useState(0)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editState, setEditState] = useState('')
  const [editNeighborhood, setEditNeighborhood] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    if (!token) return

    async function load() {
      const { data: s } = await supabase
        .from('students')
        .select('*')
        .eq('student_token', token)
        .single()

      if (!s) { setIsLoading(false); return }
      setStudent(s as Student)

      const { data: w } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('student_id', s.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setWorkouts((w as WorkoutWithExercises[]) ?? [])

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

    // Realtime: atualiza quando aluno mudar (proposta, status, trainer_id)
    // Realtime: atualiza quando trainer adicionar/alterar treino
    const channel = supabase
      .channel(`aluno_${token}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workouts' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workouts' }, () => load())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workouts' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [token])

  function openEdit() {
    if (!student) return
    setEditName(student.name)
    setEditPhone(student.phone ?? '')
    setEditGoal(student.goal ?? '')
    setEditCity((student as any).city ?? '')
    setEditState((student as any).state ?? '')
    setEditNeighborhood((student as any).neighborhood ?? '')
    setIsEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!student || !session) return
    setIsSaving(true)

    const { data: updated } = await supabase
      .from('students')
      .update({
        name: editName.trim() || student.name,
        phone: editPhone.trim() || student.phone,
        goal: editGoal.trim() || null,
        city: editCity.trim() || null,
        state: editState || null,
        neighborhood: editNeighborhood.trim() || null,
      })
      .eq('user_id', session.user.id)
      .select('*')
      .single()

    setIsSaving(false)

    if (updated) {
      setStudent(updated as Student)
      setSavedOk(true)
      setTimeout(() => { setSavedOk(false); setIsEditing(false) }, 1500)
    }
  }

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

  const canEdit = !!session && session.user.user_metadata?.role === 'student'
  const location = [(student as any).neighborhood, (student as any).city, (student as any).state]
    .filter(Boolean).join(', ')

  async function approveContract() {
    await supabase
      .from('students')
      .update({ status: 'active' })
      .eq('student_token', token)
    setStudent((prev) => prev ? { ...prev, status: 'active' } as any : prev)
  }

  async function declineContract() {
    await supabase
      .from('students')
      .update({ status: 'pending', trainer_id: null, monthly_fee: null, payment_due_day: null, proposal_message: null })
      .eq('student_token', token)
    setStudent((prev) => prev ? { ...prev, status: 'pending', trainer_id: null } as any : prev)
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
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-tz-white">{student.name}</h1>
                {student.goal && (
                  <p className="text-sm text-tz-muted mt-0.5">{student.goal}</p>
                )}
                {location && (
                  <p className="text-xs text-tz-muted/70 mt-0.5 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {location}
                  </p>
                )}
              </div>
              {canEdit && !isEditing && (
                <button
                  onClick={openEdit}
                  className="text-tz-muted hover:text-tz-white transition-colors shrink-0 mt-0.5"
                  title="Editar perfil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
            </div>
            <Badge variant="active" dot className="mt-2">Ativo</Badge>
          </div>
        </div>

        {/* Form edição */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Telefone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="5511999999999"
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Objetivo</label>
                <input
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  placeholder="Ex: emagrecer"
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Cidade</label>
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="São Paulo"
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Estado</label>
                <select
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white focus:outline-none focus:border-tz-gold/50"
                >
                  <option value="">UF</option>
                  {BR_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Bairro</label>
                <input
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  placeholder="Vila Madalena"
                  className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 py-2 rounded-tz text-sm font-semibold transition-colors ${
                  savedOk
                    ? 'bg-tz-gold text-tz-bg'
                    : 'bg-tz-electric/10 text-tz-electric hover:bg-tz-electric/20'
                }`}
              >
                {savedOk ? '✓ Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-tz text-sm text-tz-muted hover:text-tz-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Stat semanal */}
        <div className="mt-5 rounded-tz bg-tz-surface-2 border border-tz-border px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-xs text-tz-muted">Treinos concluídos essa semana</p>
            <p className="font-mono text-2xl font-bold text-tz-electric">{weekCount}</p>
          </div>
        </div>
      </div>

      {/* Proposta de contrato aguardando aprovação */}
      {student.status === 'awaiting_approval' && (
        <div className="px-5 pt-5">
          <div className="tz-card border-tz-gold/40 bg-tz-gold/5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📋</span>
              <div>
                <p className="font-semibold text-tz-white">Proposta do seu professor</p>
                <p className="text-xs text-tz-muted mt-0.5">Revise os valores e aceite para começar</p>
              </div>
            </div>

            <div className="flex gap-4">
              {(student as any).monthly_fee && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Mensalidade</p>
                  <p className="font-mono text-xl font-bold text-tz-gold mt-0.5">
                    R${(student as any).monthly_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {(student as any).payment_due_day && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Vence dia</p>
                  <p className="font-mono text-xl font-bold text-tz-white mt-0.5">{(student as any).payment_due_day}</p>
                </div>
              )}
            </div>

            {(student as any).proposal_message && (
              <p className="text-xs text-tz-muted italic border-l-2 border-tz-gold/30 pl-3">
                "{(student as any).proposal_message}"
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={approveContract}
                className="flex-1 bg-tz-gold text-tz-bg font-semibold text-sm rounded-tz py-2.5 hover:bg-tz-gold/90 transition-colors"
              >
                Aceitar proposta ✓
              </button>
              <button
                onClick={declineContract}
                className="px-4 py-2.5 rounded-tz text-sm text-tz-muted border border-tz-border hover:text-tz-error hover:border-tz-error/30 transition-colors"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA sem professor */}
      {!(student as any).trainer_id && (
        <div className="px-5 pt-5">
          <div className="tz-card border-tz-gold/30 bg-tz-gold/5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🏋️</span>
              <div>
                <p className="font-semibold text-tz-white">Você ainda não tem um professor</p>
                <p className="text-xs text-tz-muted mt-1">
                  Encontre um personal trainer e solicite o vínculo para começar seus treinos.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/professores')}
              className="w-full bg-tz-gold text-tz-bg font-semibold text-sm rounded-tz py-2.5 hover:bg-tz-gold/90 transition-colors"
            >
              Encontrar professor →
            </button>
          </div>
        </div>
      )}

      {/* Treinos */}
      <div className="flex-1 px-5 py-5">
        <h2 className="tz-section-title mb-4">Meus treinos</h2>

        {workouts.length === 0 ? (
          <div className="tz-card flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🏋️</span>
            <p className="text-tz-muted text-sm">Nenhum treino disponível ainda.</p>
            <p className="text-xs text-tz-muted">
              {(student as any).trainer_id
                ? 'Seu professor vai adicionar em breve!'
                : 'Conecte-se a um professor para receber seus treinos.'}
            </p>
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
