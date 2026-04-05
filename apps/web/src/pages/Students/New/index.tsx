import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@treinozap/ui'
import { createStudentSchema, type CreateStudentFormData } from '@schemas/student'
import { createStudent } from '@services/students'
import { useAuth } from '@contexts/auth'
import { supabase } from '@lib/supabase'

export function StudentNewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
  })

  async function onSubmit(data: CreateStudentFormData) {
    setApiError(null)
    try {
      const { data: trainerData } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      await createStudent({
        trainer_id: trainerData!.id,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        goal: data.goal || null,
        monthly_fee: data.monthly_fee ?? null,
        payment_due_day: data.payment_due_day ?? null,
        status: 'active',
      })
      navigate('/students')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setApiError(msg)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tz-white">Novo aluno</h1>
        <p className="text-sm text-tz-muted mt-0.5">Preencha os dados do aluno</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          placeholder="João Silva"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="WhatsApp"
          type="tel"
          placeholder="(11) 99999-9999"
          hint="Usado para enviar mensagens diretamente"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="joao@email.com (opcional)"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Objetivo"
          placeholder="Ex: Perder peso, ganhar massa..."
          error={errors.goal?.message}
          {...register('goal')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mensalidade (R$)"
            type="number"
            placeholder="150"
            min="0"
            step="0.01"
            error={errors.monthly_fee?.message}
            {...register('monthly_fee')}
          />
          <Input
            label="Dia vencimento"
            type="number"
            placeholder="10"
            min="1"
            max="31"
            error={errors.payment_due_day?.message}
            {...register('payment_due_day')}
          />
        </div>

        {apiError && (
          <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-4 py-2">
            {apiError}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Cadastrar aluno
          </Button>
        </div>
      </form>
    </div>
  )
}
