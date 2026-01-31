import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { ITablaConfig } from '../types/tablaConfig.types'

const ENDPOINT = Object.freeze({
  TABLACONFIG: '/tabla-config',
  mostrarDatos() {
    return this.TABLACONFIG + `/datos`
  },
  obtenerArancelesAbog(){
    return this.TABLACONFIG + `/aranceles-doc`
  }

})

const mostrarDatos = async () => {
  const response = await axios
    .get<{ data: ITablaConfig }>(`${ENDPOINT.mostrarDatos()}`)
    .catch(() => undefined)
  return response?.data.data
}
const obtenerArancelesAbog = async () => {
  const response = await axios
    .get<{ data: ITablaConfig }>(`${ENDPOINT.obtenerArancelesAbog()}`)
    .catch(() => undefined)
  return response?.data.data
}

const updateTablaConfig = async (formData: FormData) => {
  try {
    const id = formData.get('id')
    if (!id) throw new Error('id es requerido')
    const response = await axios.post<{ response: ITablaConfig }>(
      `${ENDPOINT.TABLACONFIG}/actualizar`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response?.data.response
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string; errors: Record<string, string[]> }>
      if (axiosError.response) {
        const errorMessage = axiosError.response.data.message
        const errorDetails = axiosError.response.data.errors
        console.error('Error al actualizar:', errorMessage, errorDetails)

        throw new Error(errorMessage)
      }
    }
    throw new Error('Error desconocido al intentar actualizar datos.')
  }
}
const updateArancelAbogado = async (formData: FormData) => {
  const formDataObj: any = {}
  formData.forEach((value, key) => {
    formDataObj[key] = value
  })
  console.log('formData carga update', formDataObj)

  const response = await axios
    .post<{ response: ITablaConfig }>(`${ENDPOINT.TABLACONFIG}/actualizar-arancel`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .catch(() => undefined)

  return response?.data.response
}
const updateAcuerdosUsuarios = async (formData: FormData) => {
  const formDataObj: any = {}
  formData.forEach((value, key) => {
    formDataObj[key] = value
  })
  console.log('formData carga update', formDataObj)

  const response = await axios
    .post<{ response: ITablaConfig }>(`${ENDPOINT.TABLACONFIG}/actualizar-acuerdos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .catch(() => undefined)

  return response?.data.response
}

export default {
  mostrarDatos,
  updateTablaConfig,
  updateArancelAbogado,
  obtenerArancelesAbog,
  updateAcuerdosUsuarios
}
