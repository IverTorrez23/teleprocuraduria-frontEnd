import axios from '@/config/axios'
import { handleAxiosResponse } from '@/common/utils/handleAxiosResponse'
import type { IPerfilUsuario } from '../types/PerfilUsuario.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'

const ENDPOINT = Object.freeze({
  PERFIL_USUARIO: '/perfil',
  ACTUALIZAR_PERFIL: '/perfil/actualizar',
  CAMBIAR_FOTO: '/perfil/cambiar-foto',
  CAMBIAR_PASSWORD: '/perfil/cambiar-password'
})

const obtenerPerfil = async (): Promise<ServiceResponse<IPerfilUsuario>> => {
  const request = axios.get<{ status: string; data: { user: IPerfilUsuario } }>(
    ENDPOINT.PERFIL_USUARIO
  )
  return handleAxiosResponse(request)
}

const actualizarPerfil = async (data: IPerfilUsuario): Promise<ServiceResponse<any>> => {
  const request = axios.post(ENDPOINT.ACTUALIZAR_PERFIL, data)
  return handleAxiosResponse(request)
}

const cambiarFoto = async (foto: File): Promise<ServiceResponse<null>> => {
  const formData = new FormData()
  formData.append('foto', foto)

  const request = axios.post(ENDPOINT.CAMBIAR_FOTO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return handleAxiosResponse(request)
}

const cambiarPassword = async (data: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}): Promise<ServiceResponse<null>> => {
  const request = axios.patch(ENDPOINT.CAMBIAR_PASSWORD, data)
  return handleAxiosResponse(request)
}

export default {
  obtenerPerfil,
  actualizarPerfil,
  cambiarFoto,
  cambiarPassword
}
