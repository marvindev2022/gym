import { supabase } from '@lib/supabase'
import type { Student, StudentCreate, StudentUpdate } from '@treinozap/types'

async function getTrainerId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) throw new Error('Perfil de trainer não encontrado')
  return data.id
}

export async function listStudents(): Promise<Student[]> {
  const trainerId = await getTrainerId()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Student[]
}

export async function createStudent(payload: StudentCreate): Promise<Student> {
  const trainerId = await getTrainerId()
  const { data, error } = await supabase
    .from('students')
    .insert({ ...payload, trainer_id: trainerId })
    .select()
    .single()

  if (error) throw error
  return data as Student
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Student
}

export async function updateStudent(id: string, payload: StudentUpdate): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Student
}

export async function getInactiveStudents(days = 7): Promise<Student[]> {
  const trainerId = await getTrainerId()
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('status', 'active')
    .or(`last_activity_at.lt.${cutoff},last_activity_at.is.null`)

  if (error) throw error
  return data as Student[]
}
