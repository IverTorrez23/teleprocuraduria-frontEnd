import axios from '@/config/axios'
import axios2 from '@/config/axios2'
import { isAxiosError } from 'axios'
import type { IDescarga } from '../types/descarga.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  DESCARGAS: '/descargas',
  deleteDescarga(id: number) {
    return this.DESCARGAS + `/eliminar/${id}`
  },
  obtenerUnaDescarga(id: number) {
    return this.DESCARGAS + `/${id}`
  },
  obtenerUltimaFojaCausa(id: number) {
    return this.DESCARGAS + `/ultima-foja/causa/${id}`
  }
})

const getDescargas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDescarga[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DESCARGAS, {
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
    console.error('Failed to fetch descargas', error)
    return CrearRespuestaPaginado()
  }
}

const obtenerUnaDescarga = async (id: number) => {
  const response = await axios
    .get<{ data: IDescarga }>(`${ENDPOINT.obtenerUnaDescarga(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createDescarga = async (descarga: Omit<IDescarga, 'id'>) => {
  try {
    const response = await axios2.post<{ response: IDescarga }>(ENDPOINT.DESCARGAS, descarga)
    return response?.data?.response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar registrar descarga')
  }
}

const updateDescarga = async (descarga: IDescarga) => {
  if (!descarga.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IDescarga }>(`${ENDPOINT.DESCARGAS}/${descarga.id}`, descarga)
    .catch(() => undefined)

  return response?.data.response
}

const deleteDescarga = async (descarga: IDescarga) => {
  if (!descarga?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteDescarga(descarga.id)).catch(() => undefined)

  return !!response
}
const obtenerUltimaFojaCausa = async (id: number) => {
  const response = await axios
    .get<{ data: IDescarga }>(`${ENDPOINT.obtenerUltimaFojaCausa(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getDescargas,
  createDescarga,
  updateDescarga,
  deleteDescarga,
  obtenerUnaDescarga,
  obtenerUltimaFojaCausa
}
