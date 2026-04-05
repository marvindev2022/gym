import type { UUID, StudentStatus } from './common'

export type Student = {
  id: UUID
  trainerId: UUID
  name: string
  phone: string          // WhatsApp — formato: 5511999999999
  email: string | null
  goal: string | null    // ex: "perder peso", "ganhar massa"
  monthlyFee: number | null
  paymentDueDay: number | null  // 1-31
  status: StudentStatus
  lastActivityAt: string | null
  createdAt: string
}

export type StudentCreate = Omit<Student, 'id' | 'createdAt' | 'lastActivityAt'> & {
  status?: StudentStatus
}

export type StudentUpdate = Partial<Pick<
  Student,
  'name' | 'phone' | 'email' | 'goal' | 'monthlyFee' | 'paymentDueDay' | 'status'
>>

export type StudentWithWorkouts = Student & {
  workouts: { id: UUID; title: string; isActive: boolean }[]
}
