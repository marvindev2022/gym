import { useEffect, useState } from 'react'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

const SPECIALTY_OPTIONS = [
  'Musculação', 'Emagrecimento', 'Hipertrofia', 'Funcional', 'HIIT',
  'Pilates', 'Yoga', 'Corrida', 'Crossfit', 'Reabilitação', 'Idosos', 'Natação',
]

export function PerfilPage() {
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState<string[]>([])
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
        .select('id, code, bio, specialty')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setTrainerId(data.id)
        setCode(data.code ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? [])
      }
      setIsLoading(false)
    }
    load()
  }, [])

  function handleCodeChange(value: string) {
    // Só letras minúsculas, números e hífen
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
        code: code.trim() || null,
        bio: bio.trim() || null,
        specialty: specialty.length ? specialty : null,
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
        {/* Código */}
        <div className="tz-card flex flex-col gap-4">
          <div>
            <h2 className="tz-section-title mb-3">Código de acesso</h2>
            <Input
              label="Seu código"
              placeholder="Ex: joaosilvafit"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              hint="Apenas letras minúsculas, números e hífen. Alunos usam este código para te encontrar."
            />
          </div>

          {shareUrl && (
            <div className="bg-tz-surface-2 rounded-tz-sm px-3 py-2.5 flex items-center justify-between gap-3">
              <p className="text-xs text-tz-muted truncate flex-1">{shareUrl}</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl)
                }}
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
    </div>
  )
}
