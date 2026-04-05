import { Link } from 'react-router-dom'
import { Button } from '@treinozap/ui'

const features = [
  {
    icon: '🔗',
    title: 'Treinos por link',
    desc: 'Compartilhe um link único para cada aluno. Ele acessa do celular sem precisar de app.',
  },
  {
    icon: '⚡',
    title: 'Alertas de inatividade',
    desc: 'Saiba quem não treina há mais de 7 dias e mande mensagem direto no WhatsApp.',
  },
  {
    icon: '💰',
    title: 'Controle financeiro',
    desc: 'Acompanhe mensalidades, vencimentos e receita estimada do mês em um painel simples.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-tz-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-tz-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-tz-sm bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-sm">TZ</span>
          </div>
          <span className="font-bold text-tz-white text-lg">TreinoZap</span>
        </div>
        <Link to="/login" className="text-sm text-tz-muted hover:text-tz-white transition-colors">
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 flex-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-tz-gold/30 bg-tz-gold/5 px-4 py-1.5 text-xs font-medium text-tz-gold mb-8">
          ✦ Para personal trainers e professores de academia
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-tz-white max-w-3xl leading-tight tracking-tight">
          Seu aluno treina mais.{' '}
          <span className="text-tz-electric">Você fatura mais.</span>
        </h1>

        <p className="mt-6 text-lg text-tz-muted max-w-xl leading-relaxed">
          Pare de gerenciar no WhatsApp. Organize treinos, reduza faltas e acompanhe cobranças —
          tudo em um lugar simples e rápido.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/signup">
            <Button size="lg" variant="primary">
              Começar grátis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Já tenho conta
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-tz border border-tz-border bg-tz-surface p-6 hover:border-tz-gold/30 transition-colors"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-semibold text-tz-white">{f.title}</h3>
              <p className="mt-2 text-sm text-tz-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing hint */}
        <p className="mt-16 text-sm text-tz-muted">
          Grátis para até 5 alunos. Pro a partir de{' '}
          <span className="text-tz-gold font-semibold">R$49/mês</span>.
        </p>
      </section>
    </div>
  )
}
