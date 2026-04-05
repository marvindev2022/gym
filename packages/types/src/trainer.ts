import type { UUID, Plan } from './common'

export type Trainer = {
  id: UUID
  userId: UUID
  name: string
  phone: string | null
  plan: Plan
  createdAt: string
}

export type TrainerCreate = Omit<Trainer, 'id' | 'createdAt'>

export type TrainerUpdate = Partial<Pick<Trainer, 'name' | 'phone' | 'plan'>>
