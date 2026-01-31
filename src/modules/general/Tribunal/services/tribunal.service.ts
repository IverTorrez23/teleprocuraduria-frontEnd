import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { ITribunal } from '../types/tribunal.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  TRIBUNAL: '/tribunal',
  listarTribunalPorCausa(id: number) {
    return this.TRIBUNAL + `/causa/listar/${id}`
  },
  deleteTribunal(id: number) {
    return this.TRIBUNAL + `/eliminar/${id}`
  },
  obtenerUnTribunal(id: number) {
    return this.TRIBUNAL + `/${id}`
  },
  listarTribunalPorCausaId(id: number) {
    return this.TRIBUNAL + `/causa/${id}`
  }
})

const getTribunales = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITribunal[] }> => {
  try {
    const response = await axios.get(ENDPOINT.TRIBUNAL, {
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
    console.error('Failed to fetch tribunal', error)
    return CrearRespuestaPaginado()
  }
}

const listarTribunalPorCausa = async (id: number) => {
  const response = await axios
    .get<{ data: ITribunal[] }>(`${ENDPOINT.listarTribunalPorCausa(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnTribunal = async (id: number) => {
  const response = await axios
    .get<{ data: ITribunal }>(`${ENDPOINT.obtenerUnTribunal(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createTribunal = async (tribunal: Omit<ITribunal, 'id'>) => {
  try {
    const response = await axios.post<{ response: ITribunal }>(ENDPOINT.TRIBUNAL, tribunal)
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
    throw new Error('Error desconocido al intentar registrar el juzgado.')
  }
}

const updateTribunal = async (tribunal: ITribunal) => {
  if (!tribunal.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: ITribunal }>(`${ENDPOINT.TRIBUNAL}/${tribunal.id}`, tribunal)
    .catch(() => undefined)

  return response?.data.response
}

const deleteTribunal = async (tribunal: ITribunal) => {
  if (!tribunal?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteTribunal(tribunal.id)).catch(() => undefined)

  return !!response
}
const listarTribunalPorCausaId = async (id: number): Promise<ITribunal[]> => {
  try {
    const response = await axios.get<{ data: ITribunal[] }>(
      `${ENDPOINT.listarTribunalPorCausa(id)}`
    )
    return response.data.data
  } catch (error: any) {
    // Propaga el error con el mensaje del backend si existe
    const message = error.response?.data?.message || 'Error al obtener tribunales por causa'
    throw new Error(message)
  }
}
export default {
  getTribunales,
  listarTribunalPorCausa,
  createTribunal,
  updateTribunal,
  deleteTribunal,
  obtenerUnTribunal,
  listarTribunalPorCausaId
}
