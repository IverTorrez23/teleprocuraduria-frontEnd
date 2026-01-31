import axios from '@/config/axios'
import type { IRetiro } from '../types/retiro.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  RETIRO: '/retiro',
  deleteRetiro(id: number) {
    return this.RETIRO + `/eliminar/${id}`
  }
})

const getRetiros = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IRetiro[] }> => {
  try {
    const response = await axios.get(ENDPOINT.RETIRO, {
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
    console.error('Failed to fetch retiros', error)
    return CrearRespuestaPaginado()
  }
}

const createRetiro = async (retiro: Omit<IRetiro, 'id'>) => {
  try {
    if (retiro.monto === 0) {
      throw new Error('Debe colocar un monto mayor a cero.')
    }
    const response = await axios.post<{ response: IRetiro }>(ENDPOINT.RETIRO, retiro)
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
    throw 'Error al hacer retiro'
  }
}

const deleteRetiro = async (retiro: IRetiro) => {
  if (!retiro?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteRetiro(retiro.id)).catch(() => undefined)

  return !!response
}

export default {
  getRetiros,
  createRetiro,
  deleteRetiro
}
