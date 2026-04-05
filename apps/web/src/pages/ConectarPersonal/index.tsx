import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

type Step = 'form' | 'found' | 'loading' | 'sent'

type TrainerPreview = {
  id: string
  name: string
  bio: string | null
  specialty: string[] | null
}

export function ConectarPersonalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [step, setStep] = useState<Step>('form')
  const [trainer, setTrainer] = useState<TrainerPreview | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Auto-busca se chegou com ?code= na URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) doSearch(codeFromUrl)
  }, [])

  async function doSearch(codeValue: string) {
    setError(null)
    setStep('loading')
    const { data } = await supabase
      .from('trainers')
      .select('id, name, bio, specialty')
      .eq('code', codeValue.trim().toLowerCase())
      .single()

    if (!data) {
      setError('Código não encontrado. Verifique com seu personal.')
      setStep('form')
      return
    }
    setTrainer(data)
    setStep('found')
  }

  async function searchTrainer(e: React.FormEvent) {
    e.preventDefault()
    doSearch(code)
  }

  async function sendRequest() {
    if (!trainer) return
    setStep('loading')

    // Pega o student_id do aluno logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const { data: student } = await supabase
      .from('students')
      .select('id, student_token')
      .eq('user_id', user.id)
      .single()

    if (!student) { setError('Aluno não encontrado.'); setStep('found'); return }

    const { error: reqError } = await supabase.from('trainer_requests').insert({
      student_id: student.id,
      trainer_id: trainer.id,
      message: message || null,
    })

    if (reqError && !reqError.message.includes('duplicate')) {
      setError(reqError.message)
      setStep('found')
      return
    }

    setStep('sent')

    // Notifica o personal (WhatsApp + email) — fire and forget
    const { data: { session } } = await supabase.auth.getSession()
    supabase.functions.invoke('notify-trainer-request', {
      body: {
        trainer_id: trainer.id,
        student_name: user.user_metadata?.name ?? user.email ?? 'Aluno',
        student_message: message || null,
        app_url: window.location.origin,
      },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    }).catch(() => {}) // silencia erro de notificação

    // Redireciona pro portal do aluno após 3s
    setTimeout(() => {
      if (student.student_token) {
        navigate(`/aluno/${student.student_token}`)
      } else {
        navigate('/professores')
      }
    }, 3000)
  }

  if (step === 'sent') {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h1 className="text-2xl font-bold text-tz-white">Solicitação enviada!</h1>
        <p className="text-tz-muted mt-2 text-sm">
          Seu personal vai receber sua solicitação e aceitar em breve.
        </p>
        <p className="text-xs text-tz-muted mt-6">Redirecionando para seu portal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="h-8 w-8 rounded bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-sm">TZ</span>
          </div>
          <span className="text-lg font-bold text-tz-white">TreinoZap</span>
        </div>

        {step === 'found' && trainer ? (
          <div className="flex flex-col gap-5">
            <div className="tz-card flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-full bg-tz-gold/10 border-2 border-tz-gold/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-tz-gold">
                  {trainer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-tz-white text-lg">{trainer.name}</p>
                {trainer.bio && <p className="text-sm text-tz-muted mt-1">{trainer.bio}</p>}
                {trainer.specialty?.length ? (
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {trainer.specialty.map((s) => (
                      <span key={s} className="text-2xs px-2 py-0.5 rounded-full bg-tz-electric/10 text-tz-electric">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm text-tz-muted">Mensagem (opcional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Quero focar em emagrecimento e treinar 3x por semana..."
                rows={3}
                className="w-full bg-tz-surface border border-tz-border rounded-tz px-4 py-3 text-sm text-tz-white placeholder-tz-muted resize-none focus:outline-none focus:border-tz-gold/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
                {error}
              </p>
            )}

            <Button fullWidth onClick={sendRequest}>
              Solicitar este personal
            </Button>
            <Button variant="ghost" fullWidth onClick={() => { setStep('form'); setTrainer(null) }}>
              Buscar outro código
            </Button>
          </div>
        ) : (
          <div className="tz-card flex flex-col gap-5">
            <div>
              <h1 className="text-xl font-bold text-tz-white">Encontre seu personal</h1>
              <p className="text-sm text-tz-muted mt-1">
                Peça o código do seu personal trainer e conecte-se agora.
              </p>
            </div>

            <form onSubmit={searchTrainer} className="flex flex-col gap-4">
              <Input
                label="Código do personal"
                placeholder="Ex: joaosilvafit"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                hint="Seu personal vai te passar esse código"
                required
              />

              {error && (
                <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth isLoading={step === 'loading'}>
                Buscar personal
              </Button>
            </form>

            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  const { data: st } = await supabase
                    .from('students')
                    .select('student_token')
                    .eq('user_id', user.id)
                    .single()
                  if (st?.student_token) { navigate(`/aluno/${st.student_token}`); return }
                }
                navigate('/professores')
              }}
              className="text-xs text-tz-muted text-center hover:text-tz-white transition-colors"
            >
              Pular por agora →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
