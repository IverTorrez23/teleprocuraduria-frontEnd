import axios from '@/config/axios'
import type { IFinalCosto } from '../types/finalCosto.types'
const ENDPOINT = Object.freeze({
  FINALCOSTOS: '/finalcostos',
  colocarCostoJudicialVenta(id: number) {
    return this.FINALCOSTOS + `/costo-judicial-venta/${id}`
  }
})

const colocarCostoJudicialVenta = async (finalCosto: IFinalCosto) => {
  if (!finalCosto.id) throw new Error('id es requerido')
  try {
    const response = await axios.patch<{ response: IFinalCosto }>(
      ENDPOINT.colocarCostoJudicialVenta(finalCosto.id),
      finalCosto
    )

    return response?.data.response
  } catch (error:any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al colocar costo judicial venta.'
  }
}

export default {
  colocarCostoJudicialVenta
}
