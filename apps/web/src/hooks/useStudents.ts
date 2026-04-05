import { useState, useEffect, useCallback } from 'react'
import type { Student } from '@treinozap/types'
import { listStudents, createStudent, getInactiveStudents } from '@services/students'
import type { CreateStudentFormData } from '@schemas/student'
import { supabase } from '@lib/supabase'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listStudents()
      setStudents(data)
    } catch (err) {
      setError('Erro ao carregar alunos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()

    // Realtime: atualiza lista quando qualquer aluno muda (aceita proposta, status, etc.)
    const channel = supabase
      .channel('students_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, fetchStudents)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students' }, fetchStudents)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'students' }, fetchStudents)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchStudents])

  async function addStudent(data: CreateStudentFormData): Promise<Student> {
    const student = await createStudent({
      trainer_id: '',
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      goal: data.goal || null,
      monthly_fee: data.monthly_fee ?? null,
      payment_due_day: data.payment_due_day ?? null,
      status: 'pending',
    })
    setStudents((prev) => [student, ...prev])
    return student
  }

  return { students, isLoading, error, refetch: fetchStudents, addStudent }
}

export function useInactiveStudents(days = 7) {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getInactiveStudents(days)
      .then(setStudents)
      .finally(() => setIsLoading(false))
  }, [days])

  return { students, isLoading }
}
