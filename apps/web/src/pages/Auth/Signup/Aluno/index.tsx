import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  goal: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function SignupAlunoPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setApiError(null)

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { role: 'student', name: data.name } },
    })

    if (signupError) { setApiError(signupError.message); return }

    if (authData.user) {
      const { error: studentError } = await supabase.from('students').insert({
        user_id: authData.user.id,
        trainer_id: null,
        name: data.name,
        email: data.email,
        phone: '',
        goal: data.goal || null,
        status: 'active',
      })

      if (studentError) { setApiError(studentError.message); return }
    }

    // Vai para conectar com um personal
    navigate('/conectar-personal')
  }

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-tz bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xl">TZ</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Link to="/signup" className="text-tz-muted hover:text-tz-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-tz-white">Criar conta de aluno</h1>
            <p className="text-sm text-tz-muted">Grátis para sempre</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Seu nome"
            placeholder="Maria Silva"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Objetivo (opcional)"
            placeholder="Ex: Perder peso, ganhar massa..."
            error={errors.goal?.message}
            {...register('goal')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {apiError && (
            <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-4 py-2">
              {apiError}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
            Criar minha conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tz-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-tz-gold font-medium transition-colors">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
