import axios from '@/config/axios'
import { isAxiosError } from 'axios'
//import type { ISugerenciaGasto } from '../types/sugerenciaGasto.types'
import type { IPlantillaInformacion } from '../types/plantillaInformacion.types' 
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  PLANTILLAINFORMACION: '/plantilla-informacion',
  deletePlantillaInformacion(id: number) {
    return this.PLANTILLAINFORMACION + `/eliminar/${id}`
  },
  updatePlantillaInformacion(id: number) {
    return this.PLANTILLAINFORMACION + `/${id}`
  },
  listarActivos() {
    return this.PLANTILLAINFORMACION + `/listar`
  }
})

const getPlantillaInformacion = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPlantillaInformacion[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PLANTILLAINFORMACION, {
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
    console.error('Failed to fetch plantilla informacion', error)
    return CrearRespuestaPaginado()
  }
}

const createPlantillaInformacion = async (plantillaInformacion: Omit<IPlantillaInformacion, 'id'>) => {
  try {
    
    const response = await axios.post<{ response: IPlantillaInformacion }>(
      ENDPOINT.PLANTILLAINFORMACION,
      plantillaInformacion
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
    throw 'Error registrar plantilla informacion'
  }
}

const deletePlantillaInformacion = async (plantillaInformacion: IPlantillaInformacion): Promise<boolean> => {
  try {
    if (!plantillaInformacion?.id) {
      throw new Error('El id de la plantilla es requerido.')
    }

    await axios.patch(ENDPOINT.deletePlantillaInformacion(plantillaInformacion.id))

    return true
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor.')
      }

      throw new Error(mensajeBackend || 'No se pudo eliminar la plantilla de informacion.')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Ocurrió un error inesperado al eliminar la plantilla de gasto.')
  }
}

const updatePlantillaInformacion = async (
  plantillaInformacion: IPlantillaInformacion
): Promise<IPlantillaInformacion> => {
  try {
    if (!plantillaInformacion?.id) {
      throw new Error('El id de la sugerencia es requerido.')
    }

    const response = await axios.patch<{
      response: IPlantillaInformacion
    }>(ENDPOINT.updatePlantillaInformacion(plantillaInformacion.id), plantillaInformacion)

    return response.data.response
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor.')
      }

      throw new Error(mensajeBackend || 'No se pudo actualizar la plantilla de informacion.')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Ocurrió un error inesperado al actualizar la plantilla de informacion.')
  }
}


const listarActivos = async (): Promise<IPlantillaInformacion[]> => {
  try {
    const response = await axios.get<{
      data: IPlantillaInformacion[]
    }>(ENDPOINT.listarActivos())

    return response.data.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'No se pudieron obtener las plantillas de informacion.'
      )
    }

    throw new Error('Ocurrió un error inesperado al obtener las plantillas de informacion.')
  }
}

export default {
  getPlantillaInformacion,
  createPlantillaInformacion,
  deletePlantillaInformacion,
  updatePlantillaInformacion,
  listarActivos
}
