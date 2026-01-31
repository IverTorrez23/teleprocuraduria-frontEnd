import axios from '@/config/axios'
import type { INotificacion } from '../types/notificacion.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  NOTIFICACION: '/notificacion',
  deleteNotificacion(id: number) {
    return this.NOTIFICACION + `/eliminar/${id}`
  }
})

const getNotificacion = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: INotificacion[] }> => {
  try {
    const response = await axios.get(ENDPOINT.NOTIFICACION, {
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
    console.error('Failed to fetch notificaciones', error)
    return CrearRespuestaPaginado()
  }
}

const createNotificacion = async (notificacion: Omit<INotificacion, 'id'>) => {
  try {
    const response = await axios.post<{ response: INotificacion }>(
      ENDPOINT.NOTIFICACION,
      notificacion
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
    throw 'Error al crear notificacion'
  }
}

const updateNotificacion = async (notificacion: INotificacion) => {
  if (!notificacion.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: INotificacion }>(
      `${ENDPOINT.NOTIFICACION}/${notificacion.id}`,
      notificacion
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
    throw 'Error al actualizar notificacion'
  }
}

const deleteNotificacion = async (notificacion: INotificacion) => {
  if (!notificacion.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: INotificacion }>(
      `${ENDPOINT.deleteNotificacion(notificacion.id)}`
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
    throw 'Error al eliminar notificacion'
  }
}

export default {
  getNotificacion,
  createNotificacion,
  deleteNotificacion,
  updateNotificacion
}
