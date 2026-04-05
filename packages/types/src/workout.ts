import type { UUID } from './common'

export type Exercise = {
  id: UUID
  workoutId: UUID
  name: string
  sets: number | null
  reps: string | null      // ex: "12-15" ou "falha"
  restSeconds: number | null
  notes: string | null
  orderIndex: number
  createdAt: string
}

export type ExerciseCreate = Omit<Exercise, 'id' | 'workoutId' | 'createdAt'>

export type Workout = {
  id: UUID
  trainerId: UUID
  studentId: UUID | null
  title: string
  description: string | null
  publicToken: string
  isActive: boolean
  createdAt: string
}

export type WorkoutCreate = Pick<Workout, 'trainerId' | 'studentId' | 'title' | 'description'>

export type WorkoutWithExercises = Workout & {
  exercises: Exercise[]
}

export type ActivityLog = {
  id: UUID
  studentId: UUID | null
  workoutId: UUID | null
  event: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
