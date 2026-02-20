import axios from '@/config/axios'
import axios2 from '@/config/axios2'
import type { ICrearOrden } from '../types/crearOrden.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'
//import type { ServiceResponse } from '@/common/utils/types/services.types'

const ENDPOINT = Object.freeze({
  ORDEN: '/orden',
  obtenerUnaOrden(id?: number) {
    return this.ORDEN + `/listado/${id ? id : ''}`
  },
})

const createOrden = async (orden: Omit<ICrearOrden, 'id'>) => {
  try {
    const response = await axios.post<{ response: ICrearOrden }>(ENDPOINT.ORDEN, orden)
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        success: false,
        error: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      success: false,
      error: 'Error en la conexión o solicitud fallida.'
    }
  }
}

/*const obtenerUnaOrden = async (id?: number): Promise<ServiceResponse<ICrearOrden>> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerUnaOrden(id))

    // Si tu backend envía un campo "message" además de los datos
    return {
      status: 'success',
      data: response.data,
      message: response.data.message || "Detalle de orden obtenido correctamente."
    }

  } catch (error: any) {
    return {
      status: 'error',
      data: null as any,
      message: error.response?.data?.message || "Ocurrió un error al obtener el detalle de la orden."
    }
  }
}*/
const obtenerUnaOrden = async (id?: number): Promise<ServiceResponse<ICrearOrden>> => {
  try {
    const response = await axios.get<{ message: string; data: ICrearOrden }>(
      ENDPOINT.obtenerUnaOrden(id)
    )

    return {
      status: 'success',
      data: response.data.data,
      message: response.data.message
    }

  } catch (error: any) {
    return {
      status: 'error',
      data: null as any,
      message: error.response?.data?.message || "Ocurrió un error al obtener el detalle de la orden."
    }
  }
}

const updateOrden = async (orden:ICrearOrden) => {
  try {
    const response = await axios.patch<{ response: ICrearOrden }>(`${ENDPOINT.ORDEN}/${orden.id}`, orden)
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        success: false,
        error: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      success: false,
      error: 'Error en la conexión o solicitud fallida.'
    }
  }
}

export default {
  createOrden,
  obtenerUnaOrden,
  updateOrden
}
