import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { IParticipante } from '../types/participante.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  PARTICIPANTE: '/participantes',
  listarparticipante() {
    return this.PARTICIPANTE + `/listar`
  },
  deleteParticipante(id: number) {
    return this.PARTICIPANTE + `/eliminar/${id}`
  },
  obtenerUnParticipante(id: number) {
    return this.PARTICIPANTE + `/${id}`
  },
  listarPorCausa(id: number) {
    return this.PARTICIPANTE + `/causa/${id}`
  }
})

const getParticipantesDeCausa = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IParticipante[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PARTICIPANTE + `/causa/listar/${idCausa}`, {
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
    console.error('Failed to fetch participantes', error)
    return CrearRespuestaPaginado()
  }
}

const listarParticipantes = async () => {
  const response = await axios
    .get<{ data: IParticipante[] }>(`${ENDPOINT.listarparticipante()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnParticipante = async (id: number) => {
  const response = await axios
    .get<{ data: IParticipante }>(`${ENDPOINT.obtenerUnParticipante(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createParticipante = async (participante: Omit<IParticipante, 'id'>) => {
  try {
    const response = await axios.post<{ response: IParticipante }>(
      ENDPOINT.PARTICIPANTE,
      participante
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
    throw new Error('Error desconocido al intentar registrar participante.')
  }
}

const updateParticipante = async (participante: IParticipante) => {
  if (!participante.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IParticipante }>(`${ENDPOINT.PARTICIPANTE}/${participante.id}`, participante)
    .catch(() => undefined)

  return response?.data.response
}

const deleteParticipante = async (participante: IParticipante) => {
  if (!participante?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteParticipante(participante.id))
    .catch(() => undefined)

  return !!response
}

const listarPorCausa = async (id: number) => {
  const response = await axios
    .get<{ data: IParticipante[] }>(`${ENDPOINT.listarPorCausa(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
export default {
  getParticipantesDeCausa,
  listarParticipantes,
  createParticipante,
  updateParticipante,
  deleteParticipante,
  obtenerUnParticipante,
  listarPorCausa
}
