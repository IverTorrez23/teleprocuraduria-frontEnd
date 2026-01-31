import axios from '@/config/axios'
import axios2 from '@/config/axios2'
import { isAxiosError } from 'axios'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ITransaccionesCausa } from '../types/transaccionesCausas.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'

const ENDPOINT = Object.freeze({
  TRANSACCIONESCAUSAS: '/transacciones-causas',

  obtenerUnaTransaccionCausa(id: number) {
    return this.TRANSACCIONESCAUSAS + `/${id}`
  },
  listadoTransaccionesDeCausa(id: number) {
    return this.TRANSACCIONESCAUSAS + `/listado-causa/${id}`
  },
  guardarDevolucion() {
    return this.TRANSACCIONESCAUSAS + `/devolucion`
  },
  listadoDepositosDeCausa(id: number) {
    return this.TRANSACCIONESCAUSAS + `/depositos/${id}`
  },
  listaTrnEnvioRecibidoCausa(causaId: number) {
    return this.TRANSACCIONESCAUSAS + `/trn-send-receib/${causaId}`
  }
})

const getTransaccionCausa = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITransaccionesCausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.TRANSACCIONESCAUSAS, {
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
    console.error('Failed to fetch compra pquetes', error)
    return CrearRespuestaPaginado()
  }
}

const getTransaccionesDeUnaCausa = async (
  options: IOpcionesPaginado,
  causaId: number
): Promise<{ pagination: IPaginado; result: ITransaccionesCausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listadoTransaccionesDeCausa(causaId), {
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
    console.error('Failed to fetch transacciones de causa', error)
    return CrearRespuestaPaginado()
  }
}

const createTransaccionCausa = async (transaccionCausa: Omit<ITransaccionesCausa, 'id'>) => {
  try {
    const response = await axios2.post<{ response: ITransaccionesCausa }>(
      ENDPOINT.TRANSACCIONESCAUSAS,
      transaccionCausa
    )
    return response?.data?.response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar realizar la transaccion.')
  }
}
const createDevolucionABilleteraGeneral = async (
  transaccionCausa: Omit<ITransaccionesCausa, 'id'>
) => {
  try {
    const response = await axios2.post<{ response: ITransaccionesCausa }>(
      ENDPOINT.TRANSACCIONESCAUSAS + '/devolucion',
      transaccionCausa
    )
    return response?.data?.response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar realizar la transaccion.')
  }
}

const obtenerUnaTransaccionCausa = async (id: number) => {
  const response = await axios
    .get<{ data: ITransaccionesCausa }>(`${ENDPOINT.obtenerUnaTransaccionCausa(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const getDepositosDeUnaCausa = async (
  options: IOpcionesPaginado,
  causaId: number
): Promise<{ pagination: IPaginado; result: ITransaccionesCausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listadoDepositosDeCausa(causaId), {
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
    console.error('Failed to fetch depositos de causa', error)
    return CrearRespuestaPaginado()
  }
}
const listaTrnEnvioRecibidoCausa = async (
  causaId: number
): Promise<ServiceResponse<ITransaccionesCausa[]>> => {
  try {
    const response = await axios.get<ITransaccionesCausa[]>(
      `${ENDPOINT.listaTrnEnvioRecibidoCausa(causaId)}`
    )
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
  getTransaccionCausa,
  createTransaccionCausa,
  obtenerUnaTransaccionCausa,
  getTransaccionesDeUnaCausa,
  createDevolucionABilleteraGeneral,
  getDepositosDeUnaCausa,
  listaTrnEnvioRecibidoCausa
}
