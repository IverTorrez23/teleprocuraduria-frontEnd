import axios from '@/config/axios'
import type { ITransaccionesContador } from '../types/transaccionesContador.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  TRANSACCIONESCONTADOR: '/transacciones-contador',
  deleteTransaccionContador(id: number) {
    return this.TRANSACCIONESCONTADOR + `/eliminar/${id}`
  },
  listarTrnContador() {
    return this.TRANSACCIONESCONTADOR + `/listado`
  },
  transaccionDevolicionAdmin() {
    return this.TRANSACCIONESCONTADOR + `/devolucion-admin`
  }
})

const getTransaccionesContador = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITransaccionesContador[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listarTrnContador(), {
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

const createTransaccion = async (transaccion: Omit<ITransaccionesContador, 'id'>) => {
  const response = await axios
    .post<{ response: ITransaccionesContador }>(ENDPOINT.TRANSACCIONESCONTADOR, transaccion)
    .catch(() => undefined)
  return response?.data?.response
}

const transaccionDevolicionAdmin = async (transaccion: Omit<ITransaccionesContador, 'id'>) => {
  try {
    const response = await axios.post<{ response: ITransaccionesContador }>(
      ENDPOINT.transaccionDevolicionAdmin(),
      transaccion
    )
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al depositar al contador'
  }
}

const deleteTransaccionContador = async (transaccion: ITransaccionesContador) => {
  if (!transaccion?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteTransaccionContador(transaccion.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getTransaccionesContador,
  createTransaccion,
  deleteTransaccionContador,
  transaccionDevolicionAdmin
}
