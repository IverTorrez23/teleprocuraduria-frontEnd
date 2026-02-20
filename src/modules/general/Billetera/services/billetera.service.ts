import axios from '@/config/axios'
import type { IBilletera, IBilleteraUsuario } from '../types/billetera.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'
const ENDPOINT = Object.freeze({
  BILLETERA: '/billetera',
  obtenerPorAbogadoId(id: number) {
    return this.BILLETERA + `/abogado/${id}`
  },
  listadoConUsuarios() {
    return this.BILLETERA + `/listado-usuarios`
  },
})

const obtenerPorAbogadoId = async (id: number) => {
  const response = await axios
    .get<{ data: IBilletera }>(`${ENDPOINT.obtenerPorAbogadoId(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const listadoConUsuarios = async (): Promise<ServiceResponse<IBilleteraUsuario[]>> => {
  try {
    const response = await axios.get<{ message: string; data: IBilleteraUsuario[] }>(`${ENDPOINT.listadoConUsuarios()}`)

    return {
      status: 'success',
      message: response.data.message,
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const msg = error.response.data?.message || 'Error en la solicitud al servidor.'
      const errors = error.response.data?.errors

      return {
        status: 'error',
        message: `Error ${statusCode}: ${msg}`,
        errors
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}

export default {
  obtenerPorAbogadoId,
  listadoConUsuarios
}
