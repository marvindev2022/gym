import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

type Step = 'loading' | 'form' | 'saving' | 'error'

export function AlunoDefinirSenhaPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Supabase troca o token do invite automaticamente ao detectar os params na URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') && session?.user) {
        setUserName(session.user.user_metadata?.student_name ?? '')
        setStep('form')
      } else if (event === 'SIGNED_OUT') {
        setStep('error')
      }
    })

    // Também verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserName(session.user.user_metadata?.student_name ?? '')
        setStep('form')
      } else {
        // Aguarda o onAuthStateChange processar o token da URL
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) setStep('error')
          })
        }, 3000)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setStep('saving')

    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setStep('form')
      return
    }

    // Busca o portal do aluno: primeiro por user_id, fallback por email
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: student } = await supabase
        .from('students')
        .select('id, student_token')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('user_id', { ascending: false, nullsFirst: false })
        .limit(1)
        .single()

      if (student) {
        // Ativa o aluno ao confirmar o cadastro
        await supabase
          .from('students')
          .update({ status: 'active', user_id: user.id })
          .eq('id', student.id)

        if (student.student_token) {
          navigate(`/aluno/${student.student_token}`, { replace: true })
          return
        }
      }
    }

    navigate('/aluno/login', { replace: true })
  }

  if (step === 'loading' || step === 'saving') {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-tz-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-[100dvh] bg-tz-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">😕</span>
        <h1 className="text-xl font-bold text-tz-white">Link inválido ou expirado</h1>
        <p className="text-sm text-tz-muted">Peça ao seu professor para reenviar o convite.</p>
        <a href="/aluno/login" className="text-tz-gold text-sm underline underline-offset-2">
          Ir para o login
        </a>
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

        <div className="tz-card flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-tz-white">
              {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Bem-vindo!'}
            </h1>
            <p className="text-sm text-tz-muted mt-1">
              Crie uma senha para acessar seu portal de treinos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth>
              Criar senha e entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
