import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@lib/supabase'
import { Button, Input } from '@treinozap/ui'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha muito curta'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setApiError(null)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      setApiError(error.message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-tz-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-tz bg-tz-gold flex items-center justify-center">
            <span className="text-tz-bg font-bold text-xl">TZ</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-tz-white text-center mb-1">Bem-vindo de volta</h1>
        <p className="text-tz-muted text-sm text-center mb-8">Entre na sua conta</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
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
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tz-muted">
          Não tem conta?{' '}
          <Link to="/signup" className="text-tz-gold hover:text-tz-gold-light font-medium transition-colors">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
