import axios from '@/config/axios'
import type { IGestionAlternativa } from '../types/gestionAlternativa.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  GESTIONALTERNATIVA: '/gestion-alternativa',
  deleteGestionAlternativa(id: number) {
    return this.GESTIONALTERNATIVA + `/eliminar/${id}`
  },
  listarGestionPorOrden(id: number) {
    return this.GESTIONALTERNATIVA + `/orden/${id}`
  },
  obtenerUnoById(id: number) {
    return this.GESTIONALTERNATIVA + `/obtener/${id}`
  },
  contarGestionesPosteriores(gestionId: number, ordenId: number) {
    return this.GESTIONALTERNATIVA + `/otras-gestiones/${gestionId}/${ordenId}`
  }
})

const getGestinesAlternativas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IGestionAlternativa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.GESTIONALTERNATIVA, {
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
    console.error('Failed to fetch gestiones alternativas', error)
    return CrearRespuestaPaginado()
  }
}

const createGestionAlternativa = async (gestionAlternativa: Omit<IGestionAlternativa, 'id'>) => {
  try {
    if (gestionAlternativa.orden_id === 0) {
      throw new Error('No hay orden seleccionada.')
    }
    const response = await axios.post<{ response: IGestionAlternativa }>(
      ENDPOINT.GESTIONALTERNATIVA,
      gestionAlternativa
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
    throw 'Error al crear gestion alternativa'
  }
}

const updateGestionAlternativa = async (gestionAlternativa: IGestionAlternativa) => {
  if (!gestionAlternativa.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: IGestionAlternativa }>(
      `${ENDPOINT.GESTIONALTERNATIVA}/${gestionAlternativa.id}`,
      gestionAlternativa
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
    throw 'Error al sugerir gestion alternativa'
  }
}

const deleteGestionAlternativa = async (gestionAlternativa: IGestionAlternativa) => {
  if (!gestionAlternativa.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: IGestionAlternativa }>(
      `${ENDPOINT.deleteGestionAlternativa(gestionAlternativa.id)}`
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
    throw 'Error al sugerir gestion alternativa'
  }
}

const listarGestionPorOrden = async (id: number): Promise<IGestionAlternativa[]> => {
  try {
    const response = await axios.get<{ data: IGestionAlternativa[] }>(
      `${ENDPOINT.listarGestionPorOrden(id)}`
    )
    return response.data.data
  } catch (error: any) {
    // Propaga el error con el mensaje del backend si existe
    const message = error.response?.data?.message || 'Error al obtener gestiones por orden'
    throw new Error(message)
  }
}

const obtenerUnoById = async (id: number) => {
  try {
    const response = await axios.get<{ data: IGestionAlternativa }>(
      `${ENDPOINT.obtenerUnoById(id)}`
    )
    return response.data.data
  } catch (error: any) {
    // Si el backend envía un mensaje específico
    const mensajeError =
      error?.response?.data?.message || 'Error al obtener la gestión alternativa.'
    throw new Error(mensajeError)
  }
}

const contarGestionesPosteriores = async (gestionId: number, ordenId: number): Promise<number> => {
  try {
    const response = await axios.get<{ data: number }>(
      ENDPOINT.contarGestionesPosteriores(gestionId, ordenId)
    )
    return response.data.data
  } catch (error: any) {
    console.error('Error al contar gestiones posteriores', error)
    throw error.response?.data?.message || 'Error al contar gestiones posteriores'
  }
}

export default {
  getGestinesAlternativas,
  createGestionAlternativa,
  deleteGestionAlternativa,
  updateGestionAlternativa,
  listarGestionPorOrden,
  obtenerUnoById,
  contarGestionesPosteriores
}
