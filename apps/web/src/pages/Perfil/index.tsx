import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'
import { usePushNotifications } from '@hooks/usePushNotifications'

const SPECIALTY_OPTIONS = [
  'Musculação', 'Emagrecimento', 'Hipertrofia', 'Funcional', 'HIIT',
  'Pilates', 'Yoga', 'Corrida', 'Crossfit', 'Reabilitação', 'Idosos', 'Natação',
]

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

type AttendanceMode = 'online' | 'presencial' | 'ambos'

export function PerfilPage() {
  const navigate = useNavigate()
  const { status: pushStatus, subscribe } = usePushNotifications()
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>('ambos')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('trainers')
        .select('id, name, phone, code, bio, specialty, city, state, neighborhood, attendance_mode')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setTrainerId(data.id)
        setName(data.name ?? '')
        setPhone(data.phone ?? '')
        setCode(data.code ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? [])
        setCity(data.city ?? '')
        setState(data.state ?? '')
        setNeighborhood(data.neighborhood ?? '')
        setAttendanceMode((data.attendance_mode as AttendanceMode) ?? 'ambos')
      }
      setIsLoading(false)
    }
    load()
  }, [])

  function handleCodeChange(value: string) {
    setCode(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  function toggleSpecialty(s: string) {
    setSpecialty((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!trainerId) return
    setError(null)
    setIsSaving(true)

    const { error: err } = await supabase
      .from('trainers')
      .update({
        name: name.trim() || undefined,
        phone: phone.trim() || null,
        code: code.trim() || null,
        bio: bio.trim() || null,
        specialty: specialty.length ? specialty : null,
        city: city.trim() || null,
        state: state || null,
        neighborhood: neighborhood.trim() || null,
        attendance_mode: attendanceMode,
      })
      .eq('id', trainerId)

    setIsSaving(false)

    if (err) {
      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        setError('Esse código já está em uso. Escolha outro.')
      } else {
        setError(err.message)
      }
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const shareUrl = code ? `${window.location.origin}/conectar-personal?code=${code}` : null

  return (
    <div className="flex flex-col gap-6 max-w-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tz-white">Meu perfil</h1>
        <p className="text-sm text-tz-muted mt-0.5">
          Configure seu perfil público para alunos te encontrarem.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Dados básicos */}
        <div className="tz-card flex flex-col gap-4">
          <h2 className="tz-section-title">Dados básicos</h2>
          <Input
            label="Nome"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Telefone (WhatsApp)"
            placeholder="5511999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Localização */}
        <div className="tz-card flex flex-col gap-4">
          <h2 className="tz-section-title">Localização</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Cidade"
                placeholder="São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-tz-muted">Estado</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-tz-surface border border-tz-border rounded-tz px-3 py-2.5 text-sm text-tz-white focus:outline-none focus:border-tz-gold/50 transition-colors"
              >
                <option value="">UF</option>
                {BR_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Bairro"
            placeholder="Vila Madalena"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />

          {/* Modo de atendimento */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-tz-muted">Modo de atendimento</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'online', label: 'Online' },
                { value: 'presencial', label: 'Presencial' },
                { value: 'ambos', label: 'Ambos' },
              ] as { value: AttendanceMode; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAttendanceMode(opt.value)}
                  className={`py-2 rounded-tz text-xs font-medium border transition-colors ${
                    attendanceMode === opt.value
                      ? 'bg-tz-gold/15 border-tz-gold/40 text-tz-gold'
                      : 'border-tz-border text-tz-muted hover:border-tz-gold/30 hover:text-tz-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Código de acesso */}
        <div className="tz-card flex flex-col gap-4">
          <h2 className="tz-section-title">Código de acesso</h2>
          <Input
            label="Seu código"
            placeholder="Ex: joaosilvafit"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            hint="Apenas letras minúsculas, números e hífen. Alunos usam este código para te encontrar."
          />
          {shareUrl && (
            <div className="bg-tz-surface-2 rounded-tz-sm px-3 py-2.5 flex items-center justify-between gap-3">
              <p className="text-xs text-tz-muted truncate flex-1">{shareUrl}</p>
              <button
                type="button"
                onClick={async () => { await navigator.clipboard.writeText(shareUrl) }}
                className="text-xs text-tz-gold hover:text-tz-gold/80 shrink-0 transition-colors"
              >
                Copiar
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="tz-card flex flex-col gap-3">
          <h2 className="tz-section-title">Bio</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você, sua experiência e método de trabalho..."
            rows={4}
            maxLength={300}
            className="w-full bg-tz-surface border border-tz-border rounded-tz px-4 py-3 text-sm text-tz-white placeholder-tz-muted resize-none focus:outline-none focus:border-tz-gold/50 transition-colors"
          />
          <p className="text-2xs text-tz-muted text-right">{bio.length}/300</p>
        </div>

        {/* Especialidades */}
        <div className="tz-card flex flex-col gap-3">
          <h2 className="tz-section-title">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  specialty.includes(s)
                    ? 'bg-tz-gold/15 border-tz-gold/40 text-tz-gold'
                    : 'border-tz-border text-tz-muted hover:border-tz-gold/30 hover:text-tz-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth isLoading={isSaving} variant={saved ? 'gold' : 'primary'}>
          {saved ? '✓ Salvo!' : 'Salvar perfil'}
        </Button>
      </form>

      {/* Ações da conta */}
      <div className="tz-card flex flex-col gap-2 mt-2">
        <h2 className="tz-section-title mb-1">Conta</h2>

        {pushStatus === 'default' && (
          <button
            onClick={subscribe}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-tz-sm text-sm font-medium text-tz-gold hover:bg-tz-gold/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            Ativar notificações
          </button>
        )}

        {pushStatus === 'granted' && (
          <p className="text-xs text-tz-muted px-3 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Notificações ativadas
          </p>
        )}

        <button
          onClick={async () => { await supabase.auth.signOut(); navigate('/login') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-tz-sm text-sm font-medium text-tz-muted hover:text-tz-error hover:bg-tz-error/10 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sair da conta
        </button>
      </div>
    </div>
  )
}
