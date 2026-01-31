import axios from '@/config/axios'
import type { IGestionOrden } from '../types/gestionOrden.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'

const ENDPOINT = Object.freeze({
  GESTIONORDEN: '/orden',
  listadoPorPisos() {
    return this.GESTIONORDEN + `/listado-por-pisos`
  },
  listadoPorUrgencias() {
    return this.GESTIONORDEN + `/listado-por-urgencias`
  },
  listadoPorEjecutar() {
    return this.GESTIONORDEN + `/listado-ejecutar`
  }
})

const listadoPorPisos = async (): Promise<ServiceResponse<IGestionOrden[]>> => {
  try {
    //const response = await axios.get<{ data: IGestionOrden[] }>(`${ENDPOINT.listadoPorPisos()}`)
    const response = await axios.get<IGestionOrden[]>(`${ENDPOINT.listadoPorPisos()}`)
    return {
      status: 'success',
      data: response.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        status: 'error',
        message: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}
const listadoPorUrgencias = async (): Promise<ServiceResponse<IGestionOrden[]>> => {
  try {
    const response = await axios.get<IGestionOrden[]>(`${ENDPOINT.listadoPorUrgencias()}`)
    return {
      status: 'success',
      data: response.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        status: 'error',
        message: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}

const listadoPorEjecutar = async (): Promise<ServiceResponse<IGestionOrden[]>> => {
  try {
    const response = await axios.get<IGestionOrden[]>(`${ENDPOINT.listadoPorEjecutar()}`)
    return {
      status: 'success',
      data: response.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        status: 'error',
        message: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}

export default {
  listadoPorPisos,
  listadoPorUrgencias,
  listadoPorEjecutar
}
