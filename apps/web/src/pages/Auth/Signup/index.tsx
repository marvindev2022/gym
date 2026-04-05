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
  phone: z.string().min(10, 'Telefone inválido').transform((v) => v.replace(/\D/g, '')),
})
type FormData = z.infer<typeof schema>

export function SignupPage() {
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
    })
    if (signupError) { setApiError(signupError.message); return }

    // Cria perfil trainer
    if (authData.user) {
      await supabase.from('trainers').insert({
        user_id: authData.user.id,
        name: data.name,
        phone: data.phone,
        plan: 'free',
      })
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

        <h1 className="text-2xl font-bold text-tz-white text-center mb-1">Criar conta</h1>
        <p className="text-tz-muted text-sm text-center mb-8">Grátis para até 5 alunos</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Seu nome" placeholder="João Silva" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="seu@email.com" error={errors.email?.message} {...register('email')} />
          <Input label="WhatsApp" type="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
          <Input label="Senha" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

          {apiError && (
            <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-4 py-2">
              {apiError}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
            Criar conta grátis
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tz-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-tz-gold hover:text-tz-gold-light font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
