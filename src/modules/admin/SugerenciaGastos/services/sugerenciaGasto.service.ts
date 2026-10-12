import axios from '@/config/axios'
import { isAxiosError } from 'axios'
import type { ISugerenciaGasto } from '../types/sugerenciaGasto.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  SUGERENCIAGASTO: '/sugerencia-gastos',
  deleteSugerenciaGasto(id: number) {
    return this.SUGERENCIAGASTO + `/eliminar/${id}`
  },
  updateSugerenciaGasto(id: number) {
    return this.SUGERENCIAGASTO + `/${id}`
  },
  listarActivosYConUnaOrden(ordenId: number) {
    return this.SUGERENCIAGASTO + `/listar/${ordenId}`
  },
  listarActivosGenerales() {
    return this.SUGERENCIAGASTO + `/listar/generales`
  }
})

const getSugerenciasGastos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ISugerenciaGasto[] }> => {
  try {
    const response = await axios.get(ENDPOINT.SUGERENCIAGASTO, {
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
    console.error('Failed to fetch sugerencias', error)
    return CrearRespuestaPaginado()
  }
}

const createSugerenciaGasto = async (sugerenciaGasto: Omit<ISugerenciaGasto, 'id'>) => {
  try {
    if (sugerenciaGasto.monto === 0) {
      throw new Error('Debe colocar un monto mayor a cero.')
    }
    const response = await axios.post<{ response: ISugerenciaGasto }>(
      ENDPOINT.SUGERENCIAGASTO,
      sugerenciaGasto
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
    throw 'Error registrar sugerencia'
  }
}

const deleteSugerenciaGasto = async (sugerenciaGasto: ISugerenciaGasto): Promise<boolean> => {
  try {
    if (!sugerenciaGasto?.id) {
      throw new Error('El id de la sugerencia es requerido.')
    }

    await axios.patch(ENDPOINT.deleteSugerenciaGasto(sugerenciaGasto.id))

    return true
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor.')
      }

      throw new Error(mensajeBackend || 'No se pudo eliminar la sugerencia de gasto.')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Ocurrió un error inesperado al eliminar la sugerencia.')
  }
}

const updateSugerenciaGasto = async (
  sugerenciaGasto: ISugerenciaGasto
): Promise<ISugerenciaGasto> => {
  try {
    if (!sugerenciaGasto?.id) {
      throw new Error('El id de la sugerencia es requerido.')
    }

    if (Number(sugerenciaGasto.monto) <= 0) {
      throw new Error('Debe colocar un monto mayor a cero.')
    }

    const response = await axios.patch<{
      response: ISugerenciaGasto
    }>(ENDPOINT.updateSugerenciaGasto(sugerenciaGasto.id), sugerenciaGasto)

    return response.data.response
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor.')
      }

      throw new Error(mensajeBackend || 'No se pudo actualizar la sugerencia de gasto.')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Ocurrió un error inesperado al actualizar la sugerencia.')
  }
}

const listarActivosYConUnaOrden = async (ordenId: number): Promise<ISugerenciaGasto[]> => {
  try {
    const response = await axios.get<{
      data: ISugerenciaGasto[]
    }>(ENDPOINT.listarActivosYConUnaOrden(ordenId))

    return response.data.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'No se pudieron obtener las sugerencias de gasto.'
      )
    }

    throw new Error('Ocurrió un error inesperado al obtener las sugerencias.')
  }
}

const listarActivosGenerales = async (): Promise<ISugerenciaGasto[]> => {
  try {
    const response = await axios.get<{
      data: ISugerenciaGasto[]
    }>(ENDPOINT.listarActivosGenerales())

    return response.data.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'No se pudieron obtener las sugerencias de gasto.'
      )
    }

    throw new Error('Ocurrió un error inesperado al obtener las sugerencias.')
  }
}

export default {
  getSugerenciasGastos,
  createSugerenciaGasto,
  deleteSugerenciaGasto,
  updateSugerenciaGasto,
  listarActivosYConUnaOrden,
  listarActivosGenerales
}
