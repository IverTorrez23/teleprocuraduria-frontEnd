export interface ValidationErrors {
  [key: string]: string[]
}

export interface ServiceResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
  errors?: ValidationErrors
}
