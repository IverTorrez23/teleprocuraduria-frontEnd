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
    const response = await axios.get<{ data: IBilleteraUsuario[] }>(`${ENDPOINT.listadoConUsuarios()}`)

    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        success: false,
        error: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      success: false,
      error: 'Error en la conexión o solicitud fallida.'
    }
  }
}

export default {
  obtenerPorAbogadoId,
  listadoConUsuarios
}
