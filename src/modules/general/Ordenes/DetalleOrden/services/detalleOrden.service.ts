import axios from '@/config/axios'
import type { IOrden } from '../../types/orden.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import { handleAxiosResponse } from '@/common/utils/handleAxiosResponse'

const ENDPOINT = Object.freeze({
  ORDEN: '/orden',
  listarDetalleOrden(id?: number) {
    return this.ORDEN + `/listado/${id ? id : ''}`
  },
  sugerirPresupuesto(id: number) {
    return this.ORDEN + `/sugerir-presupuesto/${id}`
  },
  deleteOrden(id: number) {
    return this.ORDEN + `/eliminar/${id}`
  },
  aceptarOrden(id: number) {
    return this.ORDEN + `/aceptar/${id}`
  }
})

const listarDetalleOrden = async (id?: number): Promise<ServiceResponse<IOrden>> => {
  try {
    const response = await axios.get(ENDPOINT.listarDetalleOrden(id))

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
}

const sugerirPresupuesto = async (orden: IOrden) => {
  if (!orden.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IOrden }>(`${ENDPOINT.sugerirPresupuesto(orden.id)}`, orden)
    .catch(() => undefined)

  return response?.data.response
}
const deleteOrden = async (orden: IOrden) => {
  if (!orden?.id) throw new Error('id es requerido')
  try {
    const response = await axios.patch<{ response: IOrden }>(ENDPOINT.deleteOrden(orden.id), orden)
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al eliminar orden.'
  }
}
const aceptarOrden = async (orden: IOrden) => {
  if (!orden?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.aceptarOrden(orden.id)).catch(() => undefined)

  return !!response
}

export default {
  listarDetalleOrden,
  sugerirPresupuesto,
  deleteOrden,
  aceptarOrden
}
