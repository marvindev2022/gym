import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@treinozap/ui'
import { createWorkoutSchema, type CreateWorkoutFormData } from '@schemas/workout'
import { useWorkouts } from '@hooks/useWorkouts'
import {
  DIVISOES, OBJETIVOS, GRUPOS_MUSCULARES,
  EXERCICIOS_POR_GRUPO, TODOS_EXERCICIOS, buildTitle
} from '@lib/workoutTemplates'

export function WorkoutNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { addWorkout } = useWorkouts()
  const [apiError, setApiError] = useState<string | null>(null)
  const [divisao, setDivisao] = useState('')
  const [grupo, setGrupo] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [autocomplete, setAutocomplete] = useState<Record<number, string[]>>({})

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: { student_id: studentId ?? undefined, exercises: [] },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'exercises' })

  function updateAutoTitle(d: string, g: string, o: string) {
    const t = buildTitle(d, g, o)
    if (t) setValue('title', t)
  }

  function gerarTreino() {
    if (!grupo || !EXERCICIOS_POR_GRUPO[grupo]) return
    replace(EXERCICIOS_POR_GRUPO[grupo].map(ex => ({
      name: ex.name,
      sets: String(ex.sets),
      reps: ex.reps,
      rest_seconds: String(ex.rest_seconds),
      notes: ex.notes ?? '',
    })))
  }

  function handleExerciseInput(index: number, value: string) {
    if (!value || value.length < 2) { setAutocomplete(prev => ({ ...prev, [index]: [] })); return }
    const matches = TODOS_EXERCICIOS.filter(e => e.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    setAutocomplete(prev => ({ ...prev, [index]: matches }))
  }

  function selectSuggestion(index: number, name: string) {
    setValue(`exercises.${index}.name`, name)
    setAutocomplete(prev => ({ ...prev, [index]: [] }))
  }

  async function onSubmit(data: CreateWorkoutFormData) {
    setApiError(null)
    try { await addWorkout(data); navigate('/workouts') }
    catch (err: unknown) { setApiError(err instanceof Error ? err.message : 'Erro ao criar treino.') }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tz-white">Novo treino</h1>
        <p className="text-sm text-tz-muted mt-0.5">Monte o treino ou gere automaticamente</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Builder de título */}
        <div className="tz-card flex flex-col gap-4">
          <p className="tz-section-title">Montador automático</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-tz-white">Divisão</label>
            <div className="flex flex-wrap gap-2">
              {DIVISOES.map(d => (
                <button key={d} type="button"
                  onClick={() => { setDivisao(d); updateAutoTitle(d, grupo, objetivo) }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${divisao === d ? 'bg-tz-gold text-tz-bg' : 'bg-tz-surface-2 border border-tz-border text-tz-muted hover:text-tz-white'}`}
                >{d}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-tz-white">Grupo muscular</label>
            <div className="flex flex-wrap gap-2">
              {GRUPOS_MUSCULARES.map(g => (
                <button key={g} type="button"
                  onClick={() => { setGrupo(g); updateAutoTitle(divisao, g, objetivo) }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${grupo === g ? 'bg-tz-electric text-tz-bg font-bold' : 'bg-tz-surface-2 border border-tz-border text-tz-muted hover:text-tz-white'}`}
                >{g}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-tz-white">Objetivo</label>
            <div className="flex flex-wrap gap-2">
              {OBJETIVOS.map(o => (
                <button key={o} type="button"
                  onClick={() => { setObjetivo(o); updateAutoTitle(divisao, grupo, o) }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${objetivo === o ? 'bg-tz-surface border border-tz-gold text-tz-gold' : 'bg-tz-surface-2 border border-tz-border text-tz-muted hover:text-tz-white'}`}
                >{o}</button>
              ))}
            </div>
          </div>
          {grupo && EXERCICIOS_POR_GRUPO[grupo] && (
            <button type="button" onClick={gerarTreino}
              className="flex items-center justify-center gap-2 rounded-tz bg-tz-electric/10 border border-tz-electric/30 py-3 text-sm font-bold text-tz-electric hover:bg-tz-electric/20 transition-colors"
            >
              ⚡ Gerar treino completo de {grupo}
            </button>
          )}
        </div>

        {/* Título e descrição */}
        <div className="tz-card flex flex-col gap-4">
          <Input label="Título do treino" placeholder="Ex: Treino A — Peito e Tríceps (Hipertrofia)" error={errors.title?.message} {...register('title')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-tz-white">Descrição (opcional)</label>
            <textarea placeholder="Observações gerais..." rows={2}
              className="w-full rounded-tz-sm bg-tz-surface border border-tz-border px-4 py-2.5 text-sm text-tz-white placeholder:text-tz-muted resize-none focus:outline-none focus:border-tz-gold transition-colors"
              {...register('description')} />
          </div>
        </div>

        {/* Exercícios */}
        <div className="flex flex-col gap-3">
          <h2 className="tz-section-title">Exercícios {fields.length > 0 && `(${fields.length})`}</h2>

          {fields.map((field, index) => (
            <div key={field.id} className="tz-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-tz-gold">#{index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="text-xs text-tz-muted hover:text-tz-error transition-colors">Remover</button>
              </div>
              <div className="relative">
                <input placeholder="Nome do exercício"
                  className="w-full min-h-[48px] rounded-tz-sm bg-tz-surface border border-tz-border px-4 py-2 text-sm text-tz-white placeholder:text-tz-muted focus:outline-none focus:border-tz-gold transition-colors"
                  {...register(`exercises.${index}.name`, { onChange: (e) => handleExerciseInput(index, e.target.value) })}
                />
                {autocomplete[index]?.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-tz-sm border border-tz-border bg-tz-surface-2 shadow-tz-card overflow-hidden">
                    {autocomplete[index].map(s => (
                      <button key={s} type="button" onClick={() => selectSuggestion(index, s)}
                        className="w-full px-4 py-2.5 text-sm text-left text-tz-white hover:bg-tz-gold/10 hover:text-tz-gold transition-colors"
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['Séries', 'sets', '3', 'number'], ['Reps', 'reps', '10-12', 'text'], ['Descanso (s)', 'rest_seconds', '60', 'number']].map(([label, field2, ph, type]) => (
                  <div key={field2} className="flex flex-col gap-1">
                    <label className="text-2xs text-tz-muted uppercase tracking-wide">{label}</label>
                    <input type={type} placeholder={ph} min="0"
                      className="min-h-[44px] rounded-tz-sm bg-tz-surface border border-tz-border px-3 text-sm text-tz-white focus:outline-none focus:border-tz-gold transition-colors"
                      {...register(`exercises.${index}.${field2 as 'sets' | 'reps' | 'rest_seconds' | 'notes'}`)}
                    />
                  </div>
                ))}
              </div>
              <input placeholder="Observação (ex: mantenha o cotovelo fixo)"
                className="min-h-[44px] rounded-tz-sm bg-tz-surface border border-tz-border px-3 text-sm text-tz-white placeholder:text-tz-muted focus:outline-none focus:border-tz-gold transition-colors"
                {...register(`exercises.${index}.notes`)}
              />
            </div>
          ))}

          <button type="button" onClick={() => append({ name: '', sets: '3', reps: '10-12', rest_seconds: '60', notes: '' })}
            className="flex items-center justify-center gap-2 rounded-tz-sm border border-dashed border-tz-border py-3 text-sm text-tz-muted hover:border-tz-gold hover:text-tz-gold transition-colors"
          >+ Adicionar exercício</button>
        </div>

        {apiError && <p className="text-sm text-tz-error bg-tz-error/10 border border-tz-error/20 rounded-tz-sm px-4 py-2">{apiError}</p>}

        <div className="flex gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" fullWidth isLoading={isSubmitting} disabled={fields.length === 0}>Criar treino</Button>
        </div>
      </form>
    </div>
  )
}
