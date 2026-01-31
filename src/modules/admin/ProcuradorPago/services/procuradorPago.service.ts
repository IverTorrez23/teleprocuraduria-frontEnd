import axios from '@/config/axios'
import type { IProcuradorPago } from '../types/procuradorPago.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { IFinalCosto } from '../../FinalCostos/types/finalCosto.types'
const ENDPOINT = Object.freeze({
  PROCURADORPAGO: '/procurador-pago',
  deleteProcuradorPago(id: number) {
    return this.PROCURADORPAGO + `/eliminar/${id}`
  },
  obtenerUltimoDeProcurador(id: number) {
    return this.PROCURADORPAGO + `/ultimo-pago/${id}`
  },
  obtenerListadoDePagosDeProcurador(id: number) {
    return this.PROCURADORPAGO + `/listado/${id}`
  },
  createPagoExtraordinario() {
    return this.PROCURADORPAGO + `/extraordinario`
  }
})

const getProcuradorPagos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IProcuradorPago[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PROCURADORPAGO, {
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
    console.error('Failed to fetch transacciones', error)
    return CrearRespuestaPaginado()
  }
}

const createProcuradorPago = async (
  procuradorPago: Omit<IProcuradorPago, 'id'>,
  finalCosto: IFinalCosto[]
) => {
  try {
    if (!Array.isArray(finalCosto) || finalCosto.length === 0) {
      throw new Error('No hay ordenes para hacer el pago.')
    }
    const response = await axios.post<{ response: IProcuradorPago }>(ENDPOINT.PROCURADORPAGO, {
      procuradorPago,
      finalCosto
    })
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al hacer pago al procurador'
  }
}
const createPagoExtraordinario = async (
  procuradorPago: Omit<IProcuradorPago, 'id'>,
  finalCosto: IFinalCosto[]
) => {
  try {
    if (!Array.isArray(finalCosto) || finalCosto.length === 0) {
      throw new Error('No hay ordenes para hacer el pago.')
    }
    const response = await axios.post<{ response: IProcuradorPago }>(
      ENDPOINT.createPagoExtraordinario(),
      {
        procuradorPago,
        finalCosto
      }
    )
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al hacer pago al procurador'
  }
}
const deleteProcuradorPago = async (procuradorPago: IProcuradorPago) => {
  if (!procuradorPago?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteProcuradorPago(procuradorPago.id))
    .catch(() => undefined)

  return !!response
}

const obtenerUltimoDeProcurador = async (id: number): Promise<IProcuradorPago | null> => {
  try {
    const response = await axios.get<{ data: IProcuradorPago | null }>(
      `${ENDPOINT.obtenerUltimoDeProcurador(id)}`
    )
    return response.data.data
  } catch (error) {
    // Lanza el error para capturarlo en el componente
    throw new Error('Error al obtener el último pago del procurador')
  }
}

const getProcuradorPagosDeProc = async (
  options: IOpcionesPaginado,
  procuradorId: number
): Promise<{ pagination: IPaginado; result: IProcuradorPago[] }> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerListadoDePagosDeProcurador(procuradorId), {
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
    console.error('Failed to fetch transacciones', error)
    return CrearRespuestaPaginado()
  }
}

export default {
  getProcuradorPagos,
  createProcuradorPago,
  deleteProcuradorPago,
  obtenerUltimoDeProcurador,
  getProcuradorPagosDeProc,
  createPagoExtraordinario
}
