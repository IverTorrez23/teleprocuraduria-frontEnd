import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { IMatrizCotizacion } from '../types/matrizCotizacion.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  MATRIZCOTIZACION: '/matriz-cotizacion',
  listarMatriz() {
    return this.MATRIZCOTIZACION + `/listar`
  },
  deleteMatriz(id: number) {
    return this.MATRIZCOTIZACION + `/eliminar/${id}`
  },
  obtenerUnaMatriz(id: number) {
    return this.MATRIZCOTIZACION + `/${id}`
  },
  obtenerMatrizPorPrioridadCondicion(prioridad: number, condicion: number) {
    return this.MATRIZCOTIZACION + `/prioridad-condicion/${prioridad}/${condicion}`
  },
})

const getMatriz = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IMatrizCotizacion[] }> => {
  try {
    const response = await axios.get(ENDPOINT.MATRIZCOTIZACION, {
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
    console.error('Failed to fetch matriz', error)
    return CrearRespuestaPaginado()
  }
}

const listarMatriz = async () => {
  const response = await axios
    .get<{ data: IMatrizCotizacion[] }>(`${ENDPOINT.listarMatriz()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnaMatriz = async (id: number) => {
  const response = await axios
    .get<{ data: IMatrizCotizacion }>(`${ENDPOINT.obtenerUnaMatriz(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerMatrizPorPrioridadCondicion = async (prioridad: number, condicion: number) => {
    const response = await axios
      .get<{ data: IMatrizCotizacion }>(`${ENDPOINT.obtenerMatrizPorPrioridadCondicion(prioridad,condicion)}`)
      .catch(() => undefined)
    return response?.data.data
  }

const createMatriz = async (matriz: Omit<IMatrizCotizacion, 'id'>) => {
  try {
    const response = await axios.post<{ response: IMatrizCotizacion }>(
      ENDPOINT.MATRIZCOTIZACION,
      matriz
    )
    return response?.data?.response
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
    throw new Error('Error desconocido al intentar registrar matriz.')
  }
}

const updateMatriz = async (matriz: IMatrizCotizacion) => {
  if (!matriz.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{
      response: IMatrizCotizacion
    }>(`${ENDPOINT.MATRIZCOTIZACION}/${matriz.id}`, matriz)
    .catch(() => undefined)

  return response?.data.response
}

const deleteMatriz = async (matriz: IMatrizCotizacion) => {
  if (!matriz?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteMatriz(matriz.id)).catch(() => undefined)

  return !!response
}

export default {
  getMatriz,
  listarMatriz,
  createMatriz,
  updateMatriz,
  deleteMatriz,
  obtenerUnaMatriz,
  obtenerMatrizPorPrioridadCondicion
}
