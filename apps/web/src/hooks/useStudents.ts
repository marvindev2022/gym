import { useState, useEffect, useCallback } from 'react'
import type { Student } from '@treinozap/types'
import { listStudents, createStudent, getInactiveStudents } from '@services/students'
import type { CreateStudentFormData } from '@schemas/student'

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

  useEffect(() => { fetchStudents() }, [fetchStudents])

  async function addStudent(data: CreateStudentFormData): Promise<Student> {
    const student = await createStudent({
      trainer_id: '', // será preenchido pelo service
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      goal: data.goal || null,
      monthly_fee: data.monthly_fee ?? null,
      payment_due_day: data.payment_due_day ?? null,
      status: 'active',
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
