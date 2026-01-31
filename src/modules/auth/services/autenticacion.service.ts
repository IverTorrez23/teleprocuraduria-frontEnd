import { handleAxiosResponse } from '@/common/utils/handleAxiosResponse'

import type { ICredenciales, IRegistroForm, RegistroResponse } from '../types/login.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import axios from '@/config/axios'

const ENDPOINT = Object.freeze({
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/registro',
  SEND_VERIFICATION_CODE: '/send-verification-code',
  VERIFY_CODE: '/verify-code'
})

const iniciarSesion = async (credenciales: ICredenciales): Promise<ServiceResponse<any>> => {
  const request = axios.post(ENDPOINT.LOGIN, credenciales)
  return handleAxiosResponse(request)
}

const registrarUsuario = async (
  datos: IRegistroForm
): Promise<ServiceResponse<RegistroResponse>> => {
  const request = axios.post(ENDPOINT.REGISTER, datos)
  return handleAxiosResponse(request)
}

const cerrarSesion = async (): Promise<ServiceResponse<any>> => {
  try {
    const request = axios.post(ENDPOINT.LOGOUT)
    return await handleAxiosResponse(request)
  } catch (error) {
    return {
      status: 'error',
      message: 'Error al cerrar sesión. Intenta nuevamente.'
    }
  }
}

const enviarCodigoVerificacion = async (email: string): Promise<ServiceResponse<any>> => {
  const request = axios.post(ENDPOINT.SEND_VERIFICATION_CODE, { email })
  return handleAxiosResponse(request)
}

const verificarCodigo = async (email: string, code: string): Promise<ServiceResponse<any>> => {
  const request = axios.post(ENDPOINT.VERIFY_CODE, { email, code })
  return handleAxiosResponse(request)
}

export const AutorizacionService = Object.freeze({
  iniciarSesion,
  registrarUsuario,
  cerrarSesion,
  enviarCodigoVerificacion,
  verificarCodigo
})
