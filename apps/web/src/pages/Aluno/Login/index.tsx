import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

export function AlunoLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (err || !data.user) {
      setError('Email ou senha incorretos. Verifique seus dados.')
      setIsLoading(false)
      return
    }

    // Busca o portal do aluno pelo email autenticado
    const { data: student } = await supabase
      .from('students')
      .select('student_token')
      .eq('email', data.user.email!)
      .single()

    if (student?.student_token) {
      navigate(`/aluno/${student.student_token}`, { replace: true })
    } else {
      setError('Nenhum aluno encontrado com esse email. Fale com seu professor.')
      await supabase.auth.signOut()
      setIsLoading(false)
    }
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
            <h1 className="text-xl font-bold text-tz-white">Entrar no meu portal</h1>
            <p className="text-sm text-tz-muted mt-1">
              Use o email e a senha que você criou no convite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <p className="text-xs text-tz-muted text-center">
            Ainda não criou sua senha?{' '}
            <span className="text-tz-gold">Verifique o email de convite do seu professor.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
