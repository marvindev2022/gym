export type UUID = string

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  error: string
  code: string
  statusCode: number
}

export type Plan = 'free' | 'pro' | 'premium'

export type StudentStatus = 'active' | 'inactive' | 'blocked'

export type WorkoutEvent = 'viewed_workout' | 'completed_workout' | 'started_workout'
