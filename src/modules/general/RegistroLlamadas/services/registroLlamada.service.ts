import axios from '@/config/axios'
import type { IRegistroLlamada } from '../types/registroLlamada.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  REGISTROLLAMADA: '/registro-llamadas',
  deleteRegistroLlamada(id: number) {
    return this.REGISTROLLAMADA + `/eliminar/${id}`
  },
  listarRegistroLlamadasPorGestion(id: number) {
    return this.REGISTROLLAMADA + `/por-gestion/${id}`
  },
  obtenerUnoById(id: number) {
    return this.REGISTROLLAMADA + `/obtener/${id}`
  }
})

const getRegistroLlamadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IRegistroLlamada[] }> => {
  try {
    const response = await axios.get(ENDPOINT.REGISTROLLAMADA, {
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
    console.error('Failed to fetch registro llamadas', error)
    return CrearRespuestaPaginado()
  }
}

const createRegistroLlamada = async (registroLlamada: Omit<IRegistroLlamada, 'id'>) => {
  try {
    if (registroLlamada.gestion_id === 0) {
      throw new Error('No hay gestion seleccionada.')
    }
    const response = await axios.post<{ response: IRegistroLlamada }>(
      ENDPOINT.REGISTROLLAMADA,
      registroLlamada
    )
    return response?.data.response
  } catch (error: any) {
    // Si el error es de axios (respuesta del backend con error)
    if (error?.response?.data?.message) {
      throw error.response.data.message
    }

    // Si es un error que tú lanzaste localmente
    if (error instanceof Error) {
      throw error.message
    }

    // Error desconocido
    throw 'Error al crear registro de llamada'
  }
}

const updateRegistroLlamada = async (registroLlamada: IRegistroLlamada) => {
  if (!registroLlamada.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: IRegistroLlamada }>(
      `${ENDPOINT.REGISTROLLAMADA}/${registroLlamada.id}`,
      registroLlamada
    )

    return response.data.response
  } catch (error: any) {
    // Si el error es de axios (respuesta del backend con error)
    if (error?.response?.data?.message) {
      throw error.response.data.message
    }

    // Si es un error que tú lanzaste localmente
    if (error instanceof Error) {
      throw error.message
    }

    // Error desconocido
    throw 'Error al actualizar registro de llamada'
  }
}

const deleteRegistroLlamada = async (registroLlamada: IRegistroLlamada) => {
  if (!registroLlamada.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: IRegistroLlamada }>(
      `${ENDPOINT.deleteRegistroLlamada(registroLlamada.id)}`
    )
    return response.data.response
  } catch (error: any) {
    // Si el error es de axios (respuesta del backend con error)
    if (error?.response?.data?.message) {
      throw error.response.data.message
    }

    // Si es un error que tú lanzaste localmente
    if (error instanceof Error) {
      throw error.message
    }

    // Error desconocido
    throw 'Error al eliminar registro de llamada'
  }
}

const listarRegistroLlamadasPorGestion = async (id: number): Promise<IRegistroLlamada[]> => {
  try {
    const response = await axios.get<{ data: IRegistroLlamada[] }>(
      `${ENDPOINT.listarRegistroLlamadasPorGestion(id)}`
    )
    return response.data.data
  } catch (error: any) {
    // Propaga el error con el mensaje del backend si existe
    const message = error.response?.data?.message || 'Error al obtener registros por gestion'
    throw new Error(message)
  }
}

const obtenerUnoById = async (id: number) => {
  const response = await axios
    .get<{ data: IRegistroLlamada }>(`${ENDPOINT.obtenerUnoById(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getRegistroLlamadas,
  createRegistroLlamada,
  deleteRegistroLlamada,
  updateRegistroLlamada,
  listarRegistroLlamadasPorGestion,
  obtenerUnoById
}
