import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Badge, Avatar } from '@treinozap/ui'
import { useAuth } from '@contexts/auth'
import type { Student, WorkoutWithExercises } from '@treinozap/types'

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const FITNESS_LEVELS = [
  { value: 'sedentary', label: 'Sedentário' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

function imcColor(imc: number) {
  if (imc < 18.5) return 'text-tz-electric'
  if (imc < 25)   return 'text-green-400'
  if (imc < 30)   return 'text-yellow-400'
  if (imc < 35)   return 'text-orange-400'
  return 'text-tz-error'
}

function StatItem({ label, value, color, muted }: { label: string; value: string; color?: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-2xs text-tz-muted uppercase tracking-wide">{label}</p>
      <p className={`font-mono text-base font-bold mt-0.5 ${color ?? (muted ? 'text-tz-muted' : 'text-tz-white')}`}>{value}</p>
    </div>
  )
}

const inputCls = 'bg-tz-surface border border-tz-border rounded-tz px-3 py-2.5 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50 w-full transition-colors'
const textareaCls = 'bg-tz-surface border border-tz-border rounded-tz px-3 py-2.5 text-sm text-tz-white placeholder-tz-muted focus:outline-none focus:border-tz-gold/50 w-full resize-none transition-colors'
const btnPrimary = 'flex-1 py-2.5 rounded-tz text-sm font-semibold transition-all active:scale-95'
const btnGhost = 'px-4 py-2.5 rounded-tz text-sm text-tz-muted hover:text-tz-white transition-all active:scale-95'

export function AlunoPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekCount, setWeekCount] = useState(0)

  // Evitar re-render do realtime enquanto o usuário está editando
  const isEditingRef = useRef(false)

  // Edit perfil
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editState, setEditState] = useState('')
  const [editNeighborhood, setEditNeighborhood] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  // Edit histórico médico
  const [isEditingMed, setIsEditingMed] = useState(false)
  const [medAge, setMedAge] = useState('')
  const [medWeight, setMedWeight] = useState('')
  const [medHeight, setMedHeight] = useState('')
  const [medBodyFat, setMedBodyFat] = useState('')
  const [medMuscleMass, setMedMuscleMass] = useState('')
  const [medWaist, setMedWaist] = useState('')
  const [medHip, setMedHip] = useState('')
  const [medGoalWeight, setMedGoalWeight] = useState('')
  const [medConditions, setMedConditions] = useState('')
  const [medMedications, setMedMedications] = useState('')
  const [medInjuries, setMedInjuries] = useState('')
  const [medFitnessLevel, setMedFitnessLevel] = useState('')
  const [medWeeklyAvailability, setMedWeeklyAvailability] = useState('')
  const [isSavingMed, setIsSavingMed] = useState(false)
  const [savedMedOk, setSavedMedOk] = useState(false)
  const [medError, setMedError] = useState<string | null>(null)

  useEffect(() => {
    isEditingRef.current = isEditing || isEditingMed
  }, [isEditing, isEditingMed])

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

    const channel = supabase
      .channel(`aluno_${token}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students' }, () => {
        // Não recarrega enquanto o usuário está editando (evita perder o formulário)
        if (!isEditingRef.current) load()
      })
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

  function openEditMed() {
    if (!student) return
    const s = student as any
    setMedAge(s.age?.toString() ?? '')
    setMedWeight(s.weight?.toString() ?? '')
    setMedHeight(s.height?.toString() ?? '')
    setMedBodyFat(s.body_fat?.toString() ?? '')
    setMedMuscleMass(s.muscle_mass?.toString() ?? '')
    setMedWaist(s.waist?.toString() ?? '')
    setMedHip(s.hip?.toString() ?? '')
    setMedGoalWeight(s.goal_weight?.toString() ?? '')
    setMedConditions(s.health_conditions ?? '')
    setMedMedications(s.medications ?? '')
    setMedInjuries(s.injuries ?? '')
    setMedFitnessLevel(s.fitness_level ?? '')
    setMedWeeklyAvailability(s.weekly_availability?.toString() ?? '')
    setMedError(null)
    setIsEditingMed(true)
  }

  async function handleSaveMed(e: React.FormEvent) {
    e.preventDefault()
    if (!student || !session) return
    setIsSavingMed(true)
    setMedError(null)

    const { data: updated, error } = await supabase
      .from('students')
      .update({
        age: medAge ? parseInt(medAge) : null,
        weight: medWeight ? parseFloat(medWeight) : null,
        height: medHeight ? parseFloat(medHeight) : null,
        body_fat: medBodyFat ? parseFloat(medBodyFat) : null,
        muscle_mass: medMuscleMass ? parseFloat(medMuscleMass) : null,
        waist: medWaist ? parseFloat(medWaist) : null,
        hip: medHip ? parseFloat(medHip) : null,
        goal_weight: medGoalWeight ? parseFloat(medGoalWeight) : null,
        health_conditions: medConditions.trim() || null,
        medications: medMedications.trim() || null,
        injuries: medInjuries.trim() || null,
        fitness_level: medFitnessLevel || null,
        weekly_availability: medWeeklyAvailability ? parseInt(medWeeklyAvailability) : null,
      })
      .eq('user_id', session.user.id)
      .select('*')
      .single()

    setIsSavingMed(false)

    if (error) {
      setMedError('Erro ao salvar: ' + error.message)
      return
    }

    if (updated) {
      setStudent(updated as Student)
      setSavedMedOk(true)
      setTimeout(() => {
        setSavedMedOk(false)
        setIsEditingMed(false)
      }, 1500)
    } else {
      setMedError('Não foi possível salvar. Verifique se você está logado.')
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
  const hasTrainer = !!(student as any).trainer_id
  const location = [(student as any).neighborhood, (student as any).city, (student as any).state]
    .filter(Boolean).join(', ')

  const statusMap: Record<string, { variant: 'active' | 'inactive' | 'blocked' | 'pending'; label: string }> = {
    active: { variant: 'active', label: 'Ativo' },
    inactive: { variant: 'inactive', label: 'Inativo' },
    blocked: { variant: 'blocked', label: 'Bloqueado' },
    pending: { variant: 'pending', label: 'Pendente' },
    awaiting_approval: { variant: 'pending', label: 'Aguardando aprovação' },
  }
  const statusInfo = statusMap[student.status] ?? { variant: 'inactive' as const, label: student.status }
  const s = student as any

  async function handleLogout() {
    await signOut()
    navigate('/aluno/login')
  }

  async function openChat() {
    if (!hasTrainer || !student.id || !session) return

    let { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('student_id', student.id)
      .eq('trainer_id', s.trainer_id)
      .maybeSingle()

    if (!conv) {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({ student_id: student.id, trainer_id: s.trainer_id })
        .select('id')
        .single()
      if (error) {
        alert('Não foi possível abrir o chat. Peça ao seu professor para iniciar a conversa.')
        return
      }
      conv = newConv
    }

    if (conv) navigate(`/chat/${conv.id}`)
  }

  async function approveContract() {
    await supabase.from('students').update({ status: 'active' }).eq('student_token', token)
    setStudent((prev) => prev ? { ...prev, status: 'active' } as any : prev)
  }

  async function declineContract() {
    await supabase.from('students').update({
      status: 'pending', trainer_id: null, monthly_fee: null, payment_due_day: null, proposal_message: null,
    }).eq('student_token', token)
    setStudent((prev) => prev ? { ...prev, status: 'pending', trainer_id: null } as any : prev)
  }

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col max-w-lg mx-auto pb-10">

      {/* Header — logo + logout */}
      <div className="px-5 pt-8 pb-5 border-b border-tz-border">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-tz-gold flex items-center justify-center">
              <span className="text-tz-bg font-bold text-xs">TZ</span>
            </div>
            <span className="text-xs text-tz-muted font-medium">TreinoZap</span>
          </div>
          {canEdit && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-tz-muted hover:text-tz-error transition-all active:scale-95 px-2 py-1 rounded-tz-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sair
            </button>
          )}
        </div>

        {/* Perfil */}
        <div className="flex items-start gap-4">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-tz-white truncate">{student.name}</h1>
                {student.goal && <p className="text-sm text-tz-muted mt-0.5">{student.goal}</p>}
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
                  className="text-tz-muted hover:text-tz-white transition-all active:scale-95 shrink-0 p-1"
                  title="Editar perfil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-2">
              <Badge variant={statusInfo.variant} dot>{statusInfo.label}</Badge>
            </div>
          </div>
        </div>

        {/* Botão chat — CTA destacado */}
        {session && hasTrainer && (
          <button
            onClick={openChat}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-tz bg-tz-electric text-tz-bg text-sm font-bold shadow-tz-electric hover:bg-tz-electric/90 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Conversar com professor
          </button>
        )}

        {/* Form edição perfil */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Nome</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Telefone</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="5511999999999" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Objetivo</label>
                <input value={editGoal} onChange={(e) => setEditGoal(e.target.value)} placeholder="Ex: emagrecer" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Cidade</label>
                <input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="São Paulo" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Estado</label>
                <select value={editState} onChange={(e) => setEditState(e.target.value)} className={inputCls}>
                  <option value="">UF</option>
                  {BR_STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Bairro</label>
                <input value={editNeighborhood} onChange={(e) => setEditNeighborhood(e.target.value)} placeholder="Vila Madalena" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isSaving} className={`${btnPrimary} ${savedOk ? 'bg-tz-gold text-tz-bg' : 'bg-tz-electric/10 text-tz-electric hover:bg-tz-electric/20'}`}>
                {savedOk ? '✓ Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className={btnGhost}>Cancelar</button>
            </div>
          </form>
        )}

        {/* Stat semanal */}
        <div className="mt-4 rounded-tz bg-tz-surface-2 border border-tz-border px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-xs text-tz-muted">Treinos concluídos essa semana</p>
            <p className="font-mono text-2xl font-bold text-tz-electric">{weekCount}</p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col gap-4 px-5 pt-5">

        {/* Proposta de contrato */}
        {student.status === 'awaiting_approval' && (
          <div className="tz-card p-4 border-tz-gold/40 bg-tz-gold/5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📋</span>
              <div>
                <p className="font-semibold text-tz-white">Proposta do seu professor</p>
                <p className="text-xs text-tz-muted mt-0.5">Revise os valores e aceite para começar</p>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              {s.monthly_fee && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Mensalidade</p>
                  <p className="font-mono text-xl font-bold text-tz-gold mt-0.5">
                    R${s.monthly_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {s.payment_due_day && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Vence dia</p>
                  <p className="font-mono text-xl font-bold text-tz-white mt-0.5">{s.payment_due_day}</p>
                </div>
              )}
            </div>
            {s.proposal_message && (
              <p className="text-xs text-tz-muted italic border-l-2 border-tz-gold/30 pl-3">"{s.proposal_message}"</p>
            )}
            <div className="flex gap-2">
              <button onClick={approveContract} className="flex-1 bg-tz-gold text-tz-bg font-semibold text-sm rounded-tz py-3 hover:bg-tz-gold/90 active:scale-95 transition-all">
                Aceitar proposta ✓
              </button>
              <button onClick={declineContract} className="px-4 py-3 rounded-tz text-sm text-tz-muted border border-tz-border hover:text-tz-error hover:border-tz-error/30 active:scale-95 transition-all">
                Recusar
              </button>
            </div>
          </div>
        )}

        {/* Financeiro — aluno ativo */}
        {student.status === 'active' && (s.monthly_fee || s.payment_due_day) && (
          <div className="tz-card p-4 flex flex-col gap-3">
            <p className="tz-section-title">Financeiro</p>
            <div className="flex gap-6 flex-wrap">
              {s.monthly_fee && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Mensalidade</p>
                  <p className="font-mono text-xl font-bold text-tz-gold mt-0.5">
                    R${s.monthly_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {s.payment_due_day && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide">Vence dia</p>
                  <p className="font-mono text-xl font-bold text-tz-white mt-0.5">{s.payment_due_day}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA sem professor */}
        {!hasTrainer && (
          <div className="tz-card p-4 border-tz-gold/30 bg-tz-gold/5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🏋️</span>
              <div>
                <p className="font-semibold text-tz-white">Você ainda não tem um professor</p>
                <p className="text-sm text-tz-muted mt-1">Encontre um personal trainer para começar seus treinos.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/professores')}
              className="w-full bg-tz-gold text-tz-bg font-semibold text-sm rounded-tz py-3 hover:bg-tz-gold/90 active:scale-95 transition-all"
            >
              Encontrar professor →
            </button>
          </div>
        )}

        {/* Histórico médico */}
        <div className="tz-card p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="tz-section-title">Histórico médico / Avaliação</p>
            {canEdit && !isEditingMed && (
              <button
                onClick={openEditMed}
                className="text-tz-muted hover:text-tz-gold transition-all active:scale-95 p-1"
                title="Editar histórico"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
          </div>

          {isEditingMed ? (
            <form onSubmit={handleSaveMed} className="flex flex-col gap-4">
              {/* Medidas básicas */}
              <div>
                <p className="text-xs text-tz-muted uppercase tracking-wide mb-2">Medidas básicas</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">Idade</label>
                    <input type="number" value={medAge} onChange={(e) => setMedAge(e.target.value)} placeholder="30" min="1" max="120" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">Peso (kg)</label>
                    <input type="number" value={medWeight} onChange={(e) => setMedWeight(e.target.value)} placeholder="70" step="0.1" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">Altura (cm)</label>
                    <input type="number" value={medHeight} onChange={(e) => setMedHeight(e.target.value)} placeholder="170" step="0.1" className={inputCls} />
                  </div>
                </div>
                {(() => {
                  const w = parseFloat(medWeight)
                  const h = parseFloat(medHeight)
                  if (!w || !h || h < 50) return null
                  const imc = w / Math.pow(h / 100, 2)
                  const cat =
                    imc < 18.5 ? { label: 'Abaixo do peso', cls: 'text-tz-electric' } :
                    imc < 25   ? { label: 'Peso normal', cls: 'text-green-400' } :
                    imc < 30   ? { label: 'Sobrepeso', cls: 'text-yellow-400' } :
                    imc < 35   ? { label: 'Obesidade grau I', cls: 'text-orange-400' } :
                                 { label: 'Obesidade grau II+', cls: 'text-tz-error' }
                  return (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-tz-surface-2 rounded-tz-sm">
                      <span className="text-2xs text-tz-muted uppercase tracking-wide">IMC</span>
                      <span className="font-mono font-bold text-tz-white">{imc.toFixed(1)}</span>
                      <span className={`text-xs font-medium ${cat.cls}`}>— {cat.label}</span>
                    </div>
                  )
                })()}
              </div>

              {/* Composição corporal */}
              <div>
                <p className="text-xs text-tz-muted uppercase tracking-wide mb-2">Composição corporal</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">% Gordura corporal</label>
                    <input type="number" value={medBodyFat} onChange={(e) => setMedBodyFat(e.target.value)} placeholder="20" step="0.1" min="1" max="70" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">% Massa muscular</label>
                    <input type="number" value={medMuscleMass} onChange={(e) => setMedMuscleMass(e.target.value)} placeholder="35" step="0.1" min="1" max="80" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">Cintura (cm)</label>
                    <input type="number" value={medWaist} onChange={(e) => setMedWaist(e.target.value)} placeholder="80" step="0.1" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-tz-muted">Quadril (cm)</label>
                    <input type="number" value={medHip} onChange={(e) => setMedHip(e.target.value)} placeholder="95" step="0.1" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Objetivo e disponibilidade */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-tz-muted">Peso objetivo (kg)</label>
                  <input type="number" value={medGoalWeight} onChange={(e) => setMedGoalWeight(e.target.value)} placeholder="65" step="0.1" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-tz-muted">Condicionamento</label>
                  <select value={medFitnessLevel} onChange={(e) => setMedFitnessLevel(e.target.value)} className={inputCls}>
                    <option value="">Selecionar</option>
                    {FITNESS_LEVELS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-tz-muted">Dias/semana</label>
                  <input type="number" value={medWeeklyAvailability} onChange={(e) => setMedWeeklyAvailability(e.target.value)} placeholder="3" min="1" max="7" className={inputCls} />
                </div>
              </div>

              {/* Saúde */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Condições de saúde</label>
                <textarea value={medConditions} onChange={(e) => setMedConditions(e.target.value)} placeholder="Ex: hipertensão, diabetes..." rows={2} className={textareaCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Medicamentos em uso</label>
                <textarea value={medMedications} onChange={(e) => setMedMedications(e.target.value)} placeholder="Ex: losartana 50mg..." rows={2} className={textareaCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-tz-muted">Lesões / limitações físicas</label>
                <textarea value={medInjuries} onChange={(e) => setMedInjuries(e.target.value)} placeholder="Ex: hérnia de disco L4-L5..." rows={2} className={textareaCls} />
              </div>
              {medError && (
                <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
                  {medError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSavingMed}
                  className={`${btnPrimary} ${savedMedOk ? 'bg-tz-gold text-tz-bg' : 'bg-tz-electric/10 text-tz-electric hover:bg-tz-electric/20'}`}
                >
                  {savedMedOk ? '✓ Salvo!' : isSavingMed ? 'Salvando...' : 'Salvar histórico'}
                </button>
                <button type="button" onClick={() => setIsEditingMed(false)} className={btnGhost}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Medidas básicas + IMC */}
              {(s.age || s.weight || s.height) && (
                <div className="flex gap-4 flex-wrap">
                  {s.age && <StatItem label="Idade" value={`${s.age} anos`} />}
                  {s.weight && <StatItem label="Peso" value={`${s.weight} kg`} />}
                  {s.height && <StatItem label="Altura" value={`${s.height} cm`} />}
                  {s.weight && s.height && (() => {
                    const imc = s.weight / Math.pow(s.height / 100, 2)
                    return <StatItem label="IMC" value={imc.toFixed(1)} color={imcColor(imc)} />
                  })()}
                  {s.goal_weight && <StatItem label="Peso objetivo" value={`${s.goal_weight} kg`} muted />}
                </div>
              )}
              {/* Composição corporal */}
              {(s.body_fat || s.muscle_mass || s.waist || s.hip) && (
                <div className="flex gap-4 flex-wrap">
                  {s.body_fat && <StatItem label="% Gordura" value={`${s.body_fat}%`} />}
                  {s.muscle_mass && <StatItem label="% Músculo" value={`${s.muscle_mass}%`} highlight />}
                  {s.waist && <StatItem label="Cintura" value={`${s.waist} cm`} />}
                  {s.hip && <StatItem label="Quadril" value={`${s.hip} cm`} />}
                </div>
              )}
              {/* Nível + disponibilidade */}
              {(s.fitness_level || s.weekly_availability) && (
                <div className="flex gap-4 flex-wrap">
                  {s.fitness_level && (
                    <StatItem label="Condicionamento" value={FITNESS_LEVELS.find((f) => f.value === s.fitness_level)?.label ?? s.fitness_level} />
                  )}
                  {s.weekly_availability && <StatItem label="Disponibilidade" value={`${s.weekly_availability}x/semana`} />}
                </div>
              )}
              {s.health_conditions && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide mb-1">Condições de saúde</p>
                  <p className="text-sm text-tz-white bg-tz-surface-2 rounded-tz-sm px-3 py-2">{s.health_conditions}</p>
                </div>
              )}
              {s.medications && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide mb-1">Medicamentos</p>
                  <p className="text-sm text-tz-white bg-tz-surface-2 rounded-tz-sm px-3 py-2">{s.medications}</p>
                </div>
              )}
              {s.injuries && (
                <div>
                  <p className="text-2xs text-tz-muted uppercase tracking-wide mb-1">Lesões / limitações</p>
                  <p className="text-sm text-tz-error bg-tz-error/5 rounded-tz-sm px-3 py-2 border border-tz-error/20">{s.injuries}</p>
                </div>
              )}
              {!s.age && !s.weight && !s.height && !s.health_conditions && !s.medications && !s.injuries && !s.fitness_level && (
                <p className="text-sm text-tz-muted text-center py-2">
                  {canEdit ? 'Preencha seu histórico para ajudar seu professor.' : 'Nenhuma informação médica registrada.'}
                </p>
              )}
              {canEdit && (
                <button
                  onClick={openEditMed}
                  className="text-xs text-tz-electric hover:text-tz-electric/80 active:scale-95 transition-all self-start py-1"
                >
                  + Preencher / atualizar histórico
                </button>
              )}
            </div>
          )}
        </div>

        {/* Treinos */}
        <div>
          <h2 className="tz-section-title mb-3">Meus treinos</h2>
          {workouts.length === 0 ? (
            <div className="tz-card p-8 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🏋️</span>
              <p className="text-tz-muted text-sm">Nenhum treino disponível ainda.</p>
              <p className="text-xs text-tz-muted">
                {hasTrainer ? 'Seu professor vai adicionar em breve!' : 'Conecte-se a um professor para receber seus treinos.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {workouts.map((workout) => {
                const exerciseCount = workout.exercises?.length ?? 0
                return (
                  <button
                    key={workout.id}
                    onClick={() => navigate(`/t/${(workout as any).public_token}`)}
                    className="tz-card p-4 w-full text-left hover:border-tz-gold/40 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-tz-white truncate">{workout.title}</h3>
                        {(workout as any).description && (
                          <p className="text-xs text-tz-muted mt-1 line-clamp-2">{(workout as any).description}</p>
                        )}
                      </div>
                      <svg className="text-tz-muted shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                    <div className="flex items-center gap-5 mt-4">
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

      </div>{/* /conteúdo principal */}

      <div className="px-5 pt-6 text-center flex flex-col gap-2">
        <p className="text-xs text-tz-muted">
          Powered by <span className="text-tz-gold font-medium">TreinoZap</span>
        </p>
        {!canEdit && (
          <a href="/aluno/login" className="text-xs text-tz-muted underline underline-offset-2 hover:text-tz-white transition-colors">
            Acessar com meu email
          </a>
        )}
      </div>
    </div>
  )
}
