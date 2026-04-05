import { useState, useEffect, useCallback } from 'react'
import type { WorkoutWithExercises } from '@treinozap/types'
import { listWorkouts, createWorkout } from '@services/workouts'
import type { CreateWorkoutFormData } from '@schemas/workout'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkouts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listWorkouts()
      setWorkouts(data)
    } catch {
      setError('Erro ao carregar treinos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  async function addWorkout(data: CreateWorkoutFormData): Promise<WorkoutWithExercises> {
    const workout = await createWorkout({
      student_id: data.student_id,
      title: data.title,
      description: data.description,
      exercises: (data.exercises ?? []).map((ex, i) => ({
        name: ex.name,
        sets: ex.sets as number | undefined,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds as number | undefined,
        notes: ex.notes,
        order_index: i,
      })),
    })
    setWorkouts((prev) => [workout, ...prev])
    return workout
  }

  return { workouts, isLoading, error, refetch: fetchWorkouts, addWorkout }
}
