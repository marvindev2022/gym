import { z } from 'zod'

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .transform((v) => v.replace(/\D/g, '')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  goal: z.string().max(200).optional(),
  monthly_fee: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v.replace(',', '.')) : undefined)),
  payment_due_day: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : undefined)),
})

export type CreateStudentFormData = z.input<typeof createStudentSchema>
