import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { IJuzgado } from '../types/juzgado.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  JUZGADOS: '/juzgados',
  listarJuzgado(id?: number) {
    return this.JUZGADOS + `/listar/${id ? id : ''}`
  },
  deleteJuzgado(id: number) {
    return this.JUZGADOS + `/eliminar/${id}`
  }
})

const getJuzgados = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IJuzgado[] }> => {
  try {
    const response = await axios.get(ENDPOINT.JUZGADOS, {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search),
        sort: JSON.stringify(options.sort)
      }
    })

    const data = response.data

    const pagination: IPaginado = {
      rowsPerPage: data.meta.per_page,
      rowsNumber: data.meta.total,
      totalItems: data.meta.total,
      itemCount: data.meta.to,
      perPage: data.meta.per_page,
      currentPage: data.meta.current_page
    }

    return {
      pagination,
      result: data.data
    }
  } catch (error) {
    console.error('Failed to fetch juzgados', error)
    return CrearRespuestaPaginado()
  }
}

const listarJuzgados = async (id?: number) => {
  const response = await axios
    .get<{ data: IJuzgado[] }>(`${ENDPOINT.listarJuzgado(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createJuzgado = async (formData: FormData) => {
  try {
    const response = await axios.post<{ response: IJuzgado }>(ENDPOINT.JUZGADOS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.response
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string; errors: Record<string, string[]> }>
      if (axiosError.response) {
        const errorMessage = axiosError.response.data.message
        const errorDetails = axiosError.response.data.errors
        console.error('Error en el registro:', errorMessage, errorDetails)

        throw new Error(errorMessage)
      }
    }
    throw new Error('Error desconocido al intentar registrar el juzgado.')
  }
}
const updateJuzgado = async (formData: FormData) => {
  try {
    const id = formData.get('id')
    if (!id) throw new Error('id es requerido')
    const response = await axios.post<{ response: IJuzgado }>(
      `${ENDPOINT.JUZGADOS}/${id}`,
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
    throw new Error('Error desconocido al intentar actualizar el juzgado.')
  }
}

const deleteJuzgado = async (juzgado: IJuzgado) => {
  if (!juzgado?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteJuzgado(juzgado.id)).catch(() => undefined)

  return !!response
}

export default {
  getJuzgados,
  listarJuzgados,
  createJuzgado,
  updateJuzgado,
  deleteJuzgado
}
