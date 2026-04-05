import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@treinozap/ui'
import { createWorkoutSchema, type CreateWorkoutFormData } from '@schemas/workout'
import { useWorkouts } from '@hooks/useWorkouts'

export function WorkoutNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { addWorkout } = useWorkouts()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      student_id: studentId ?? undefined,
      exercises: [{ name: '', sets: '', reps: '', rest_seconds: '', notes: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })

  async function onSubmit(data: CreateWorkoutFormData) {
    setApiError(null)
    try {
      await addWorkout(data)
      navigate('/workouts')
    } catch {
      setApiError('Erro ao criar treino. Tente novamente.')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tz-white">Novo treino</h1>
        <p className="text-sm text-tz-muted mt-0.5">Adicione os exercícios do treino</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Info do treino */}
        <div className="tz-card flex flex-col gap-4">
          <Input
            label="Título do treino"
            placeholder="Treino A — Peito e Tríceps"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-tz-white">Descrição (opcional)</label>
            <textarea
              placeholder="Observações gerais do treino..."
              rows={2}
              className="w-full rounded-tz-sm bg-tz-surface border border-tz-border px-4 py-2.5 text-sm text-tz-white placeholder:text-tz-muted resize-none focus:outline-none focus:border-tz-gold transition-colors"
              {...register('description')}
            />
          </div>
        </div>

        {/* Exercícios */}
        <div className="flex flex-col gap-3">
          <h2 className="tz-section-title">Exercícios</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="tz-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-tz-gold">#{index + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-tz-muted hover:text-tz-error transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
              <Input
                placeholder="Nome do exercício (ex: Supino Reto)"
                error={errors.exercises?.[index]?.name?.message}
                {...register(`exercises.${index}.name`)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Séries"
                  type="number"
                  min="1"
                  {...register(`exercises.${index}.sets`)}
                />
                <Input
                  placeholder="Reps (ex: 12)"
                  {...register(`exercises.${index}.reps`)}
                />
                <Input
                  placeholder="Descanso (s)"
                  type="number"
                  min="0"
                  {...register(`exercises.${index}.rest_seconds`)}
                />
              </div>
              <Input
                placeholder="Observações (opcional)"
                {...register(`exercises.${index}.notes`)}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ name: '', sets: '', reps: '', rest_seconds: '', notes: '' })}
            className="flex items-center justify-center gap-2 rounded-tz-sm border border-dashed border-tz-border py-3 text-sm text-tz-muted hover:border-tz-gold hover:text-tz-gold transition-colors"
          >
            + Adicionar exercício
          </button>
          {errors.exercises?.root && (
            <p className="text-xs text-tz-error">{errors.exercises.root.message}</p>
          )}
        </div>

        {apiError && (
          <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-4 py-2">
            {apiError}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Criar treino
          </Button>
        </div>
      </form>
    </div>
  )
}
