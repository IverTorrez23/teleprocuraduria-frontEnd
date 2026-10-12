import axios from '@/config/axios'
import { isAxiosError } from 'axios'

import type { ISugerenciaOrden } from '../types/sugerenciaOrden.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  SUGERENCIAORDEN: '/sugerencia-orden',
  listarActivosDeOrden(ordenId: number) {
    return this.SUGERENCIAORDEN + `/${ordenId}`
  }
})


const listarActivosDeOrden = async (ordenId: number): Promise<ISugerenciaOrden[]> => {
  try {
    const response = await axios.get<{
      data: ISugerenciaOrden[]
    }>(ENDPOINT.listarActivosDeOrden(ordenId))

    return response.data.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'No se pudieron obtener las sugerencias de orden.'
      )
    }

    throw new Error('Ocurrió un error inesperado al obtener las sugerencias.')
  }
}

export default {
  listarActivosDeOrden
}
