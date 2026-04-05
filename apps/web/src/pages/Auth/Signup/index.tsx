import { Link } from 'react-router-dom'

export function SignupPage() {
  return (
    <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-tz bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xl">TZ</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-tz-white text-center mb-1">Criar conta</h1>
        <p className="text-tz-muted text-sm text-center mb-8">Como você quer usar o TreinoZap?</p>

        <div className="flex flex-col gap-4">
          <Link to="/signup/personal" className="tz-card border-2 border-transparent hover:border-tz-gold/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-tz bg-tz-gold/10 flex items-center justify-center shrink-0 group-hover:bg-tz-gold/20 transition-colors">
                <span className="text-2xl">🏋️</span>
              </div>
              <div>
                <p className="font-bold text-tz-white">Sou Personal Trainer</p>
                <p className="text-sm text-tz-muted mt-0.5">
                  Gerencio alunos, crio treinos e acompanho resultados
                </p>
              </div>
              <svg className="ml-auto text-tz-muted shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>

          <Link to="/signup/aluno" className="tz-card border-2 border-transparent hover:border-tz-electric/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-tz bg-tz-electric/10 flex items-center justify-center shrink-0 group-hover:bg-tz-electric/20 transition-colors">
                <span className="text-2xl">💪</span>
              </div>
              <div>
                <p className="font-bold text-tz-white">Sou Aluno</p>
                <p className="text-sm text-tz-muted mt-0.5">
                  Acesso meus treinos e acompanho minha evolução
                </p>
              </div>
              <svg className="ml-auto text-tz-muted shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-tz-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-tz-gold font-medium transition-colors hover:text-tz-gold/80">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
