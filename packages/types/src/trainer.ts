import type { UUID, Plan } from './common'

export type AttendanceMode = 'online' | 'presencial' | 'ambos'

export type Trainer = {
  id: UUID
  userId: UUID
  name: string
  phone: string | null
  plan: Plan
  code: string | null
  bio: string | null
  specialty: string[] | null
  city: string | null
  state: string | null
  neighborhood: string | null
  attendance_mode: AttendanceMode
  createdAt: string
}

export type TrainerCreate = Omit<Trainer, 'id' | 'createdAt'>

export type TrainerUpdate = Partial<Pick<
  Trainer,
  'name' | 'phone' | 'plan' | 'code' | 'bio' | 'specialty' | 'city' | 'state' | 'neighborhood' | 'attendance_mode'
>>
