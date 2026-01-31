import axios from '@/config/axios'
import type { ITransaccionesAdmin } from '../types/transaccionesAdmin.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  TRANSACCIONESADMIN: '/transacciones-admin',
  deleteTransaccionAdmin(id: number) {
    return this.TRANSACCIONESADMIN + `/eliminar/${id}`
  },
  listarTrnAdmin() {
    return this.TRANSACCIONESADMIN + `/listado`
  },
  transaccionAContador(){
     return this.TRANSACCIONESADMIN + `/trn-contador`
  }
})

const getTransaccionesAdmin = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITransaccionesAdmin[] }> => {
  try {
    const response = await axios.get(ENDPOINT.listarTrnAdmin(), {
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

const createTransaccion = async (transaccion: Omit<ITransaccionesAdmin, 'id'>) => {
  const response = await axios
    .post<{ response: ITransaccionesAdmin }>(ENDPOINT.TRANSACCIONESADMIN, transaccion)
    .catch(() => undefined)
  return response?.data?.response 
}

const transaccionAContador = async (transaccion: Omit<ITransaccionesAdmin, 'id'>) => {
  try {
    const response = await axios.post<{ response: ITransaccionesAdmin }>(
      ENDPOINT.transaccionAContador(),
      transaccion
    )
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al depositar al contador'
  }
}

const deleteTransaccionAdmin = async (transaccion: ITransaccionesAdmin) => {
  if (!transaccion?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteTransaccionAdmin(transaccion.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getTransaccionesAdmin,
  createTransaccion,
  deleteTransaccionAdmin,
  transaccionAContador
}
