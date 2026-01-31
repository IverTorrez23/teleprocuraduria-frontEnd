import axios, { AxiosError } from 'axios'
import type { ServiceResponse, ValidationErrors } from './types/services.types'

export const handleAxiosResponse = async <T>(
  request: Promise<any>
): Promise<ServiceResponse<T>> => {
  try {
    const response = await request

    if (response.data?.status === 'error') {
      return {
        status: 'error',
        message: response.data.message || 'Error en la solicitud.',
        errors: response.data.errors || {}
      }
    }

    return {
      status: 'success',
      message: response.data.message,
      data: response.data
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; errors?: ValidationErrors }>
      const responseData = axiosError.response?.data

      return {
        status: 'error',
        message: responseData?.message || 'Error desconocido.',
        errors: responseData?.errors || {}
      }
    }

    return {
      status: 'error',
      message: 'Error inesperado.',
      errors: {}
    }
  }
}
