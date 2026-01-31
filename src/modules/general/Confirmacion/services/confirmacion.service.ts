import axios from '@/config/axios'
import type { IConfirmacion } from '../types/confirmacion.types'
const ENDPOINT = Object.freeze({
  CONFIRMACION: '/confirmacion',
  pronunciaAbogado(id: number) {
    return this.CONFIRMACION + `/pronuncio-abogado/${id}`
  },
  pronunciaContador(id: number) {
    return this.CONFIRMACION + `/pronuncio-contador/${id}`
  },
  devolverSaldoMasivo(){
    return this.CONFIRMACION + `/pronuncio-contador/devolucion-masivo`
  }
})

const pronunciaAbogado = async (confirmacion: IConfirmacion) => {
  if (!confirmacion.id) throw new Error('id es requerido')
  try {
    const response = await axios.patch<{ response: IConfirmacion }>(
      ENDPOINT.pronunciaAbogado(confirmacion.id),
      confirmacion
    )
    return response?.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al colocar costo judicial venta.'
  }
}
const pronunciaContador = async (confirmacion: IConfirmacion) => {
  if (!confirmacion.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IConfirmacion }>(ENDPOINT.pronunciaContador(confirmacion.id), confirmacion)
    .catch(() => undefined)

  return response?.data.response
}
const devolverSaldoMasivo = async (
  confirmaciones: IConfirmacion[]
): Promise<{ message: string }> => {
  if (!Array.isArray(confirmaciones) || confirmaciones.length === 0) {
    throw new Error('Debe seleccionar al menos un presupuesto para la entrega masiva.')
  }

  try {
    const response = await axios.post<{ message: string }>(
      ENDPOINT.devolverSaldoMasivo(),
      confirmaciones
    )
    return response.data
  } catch (error: any) {
    // Si el backend envía un mensaje en error.response.data.message, lo lanzamos
    throw error.response?.data?.message || 'Error al devolver presupuestos masivos.'
  }
}

export default {
  pronunciaAbogado,
  pronunciaContador,
  devolverSaldoMasivo
}
