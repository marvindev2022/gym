import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Nome do exercício é obrigatório'),
  sets: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  reps: z.string().max(20).optional(),
  rest_seconds: z.string().optional().transform((v) => (v ? parseInt(v) : undefined)),
  notes: z.string().optional(),
})

export const createWorkoutSchema = z.object({
  student_id: z.string().optional(),
  title: z.string().min(2, 'Título deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Adicione ao menos 1 exercício'),
})

export type CreateWorkoutFormData = z.input<typeof createWorkoutSchema>
export type ExerciseFormData = z.input<typeof exerciseSchema>
