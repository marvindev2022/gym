import { supabase } from '@lib/supabase'
import type { Workout, WorkoutWithExercises } from '@treinozap/types'

async function getTrainerId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data } = await supabase.from('trainers').select('id').eq('user_id', user.id).single()
  return data!.id
}

export async function listWorkouts(): Promise<WorkoutWithExercises[]> {
  const trainerId = await getTrainerId()
  const { data, error } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WorkoutWithExercises[]
}

export async function createWorkout(payload: {
  student_id?: string
  title: string
  description?: string
  exercises: { name: string; sets?: number; reps?: string; rest_seconds?: number; notes?: string; order_index: number }[]
}): Promise<WorkoutWithExercises> {
  const trainerId = await getTrainerId()
  const { exercises, ...workoutData } = payload

  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({ ...workoutData, trainer_id: trainerId })
    .select()
    .single()

  if (workoutError) throw workoutError

  if (exercises.length > 0) {
    const exercisesWithWorkoutId = exercises.map((ex, i) => ({
      ...ex,
      workout_id: workout.id,
      order_index: i,
    }))
    const { error: exError } = await supabase.from('exercises').insert(exercisesWithWorkoutId)
    if (exError) throw exError
  }

  // Retorna com exercícios
  const { data, error } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('id', workout.id)
    .single()

  if (error) throw error
  return data as WorkoutWithExercises
}

export async function getWorkoutByToken(token: string): Promise<WorkoutWithExercises | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('public_token', token)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as WorkoutWithExercises
}

export async function updateWorkoutStatus(
  workoutId: string,
  status: 'active' | 'in_progress' | 'completed'
): Promise<void> {
  await supabase.from('workouts').update({ status }).eq('id', workoutId)
}

export async function logWorkoutActivity(
  workoutId: string,
  studentId: string | null,
  event: string
): Promise<void> {
  await supabase.from('activity_logs').insert({
    workout_id: workoutId,
    student_id: studentId,
    event,
    metadata: {},
  })
}
