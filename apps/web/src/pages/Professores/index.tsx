import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Button } from '@treinozap/ui'

type TrainerPublic = {
  id: string
  name: string
  bio: string | null
  specialty: string[] | null
  code: string
  city: string | null
  state: string | null
  neighborhood: string | null
  attendance_mode: string | null
}

const attendanceLabel: Record<string, string> = {
  online: 'Online',
  presencial: 'Presencial',
  ambos: 'Online + Presencial',
}

export function ProfessoresPage() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState<TrainerPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('trainers')
      .select('id, name, bio, specialty, code, city, state, neighborhood, attendance_mode')
      .not('code', 'is', null)
      .order('name')
      .then(({ data }) => {
        setTrainers((data as TrainerPublic[]) ?? [])
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-tz-border">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="h-6 w-6 rounded bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xs">TZ</span>
          </div>
          <span className="text-sm font-bold text-tz-white">TreinoZap</span>
        </div>
        <h1 className="text-2xl font-bold text-tz-white text-center">Encontre seu personal</h1>
        <p className="text-sm text-tz-muted text-center mt-1">
          Escolha um professor e solicite o vínculo
        </p>
      </div>

      {/* Lista */}
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trainers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl">🏋️</span>
            <p className="text-tz-muted text-sm">Nenhum professor disponível no momento.</p>
            <p className="text-xs text-tz-muted">Peça o código do seu professor e conecte-se.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/conectar-personal')}
            >
              Tenho um código
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trainers.map((trainer) => {
              const location = [trainer.neighborhood, trainer.city, trainer.state]
                .filter(Boolean).join(', ')
              const mode = trainer.attendance_mode ? attendanceLabel[trainer.attendance_mode] : null

              return (
                <div key={trainer.id} className="tz-card flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-tz-gold/10 border border-tz-gold/20 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-tz-gold">
                      {trainer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-tz-white">{trainer.name}</p>

                    {/* Localização + modo */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {location && (
                        <p className="text-xs text-tz-muted flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {location}
                        </p>
                      )}
                      {mode && (
                        <p className="text-xs text-tz-muted/70">{mode}</p>
                      )}
                    </div>

                    {trainer.bio && (
                      <p className="text-xs text-tz-muted mt-1.5 line-clamp-2">{trainer.bio}</p>
                    )}
                    {trainer.specialty?.length ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {trainer.specialty.map((s) => (
                          <span
                            key={s}
                            className="text-2xs px-2 py-0.5 rounded-full bg-tz-electric/10 text-tz-electric"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate(`/conectar-personal?code=${trainer.code}`)}
                    >
                      Solicitar este professor
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 text-center">
        <button
          onClick={() => navigate('/conectar-personal')}
          className="text-xs text-tz-muted hover:text-tz-white transition-colors"
        >
          Tenho o código do meu professor →
        </button>
      </div>
    </div>
  )
}
