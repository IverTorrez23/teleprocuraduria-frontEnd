import axios from '@/config/axios'
import type { IBilleteraTransaccion } from '../types/billeteraTransaccion.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  BILLETERATRANSACCION: '/billetera-transaccion',
  deleteBilleteraTransaccion(id: number) {
    return this.BILLETERATRANSACCION + `/eliminar/${id}`
  },
  listarPorBilletera(fechaIni:string,fechaFin:string,billeteraId: number ) {
    return this.BILLETERATRANSACCION + `/listado-billetera/${fechaIni}/${fechaFin}/${billeteraId}`
  },
  listarDepPorAdmin() {
    return this.BILLETERATRANSACCION + `/listado-dep-admin`
  },
})

const getTransaccionesBilletera = async (
  options: IOpcionesPaginado,
  fechaIni: string,
  fechaFin: string,
  billeteraId: number,
): Promise<{ pagination: IPaginado; result: IBilleteraTransaccion[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listarPorBilletera(fechaIni,fechaFin,billeteraId), {
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

const getTransaccionesDepBilleteraAdmin = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IBilleteraTransaccion[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listarDepPorAdmin(), {
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

/*const createTransaccion = async (transaccion: Omit<IBilleteraTransaccion, 'id'>) => {
  const response = await axios
    .post<{ response: IBilleteraTransaccion }>(ENDPOINT.BILLETERATRANSACCION, transaccion)
    .catch(() => undefined)
  return response?.data?.response
}*/

const createTransaccion = async (transaccion: Omit<IBilleteraTransaccion, 'id'>) => {
  try {
    const response = await axios.post<{ response: IBilleteraTransaccion }>(
      ENDPOINT.BILLETERATRANSACCION,
      transaccion
    )
    return response.data.response
  } catch (error: any) {
    // Relanzamos el mensaje del backend si existe
    throw error.response?.data?.message || 'Error desconocido al depositar.'
  }
}

const deleteBilleteraTransaccion = async (transaccion: IBilleteraTransaccion) => {
  if (!transaccion?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteBilleteraTransaccion(transaccion.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getTransaccionesBilletera,
  createTransaccion,
  deleteBilleteraTransaccion,
  getTransaccionesDepBilleteraAdmin
}
