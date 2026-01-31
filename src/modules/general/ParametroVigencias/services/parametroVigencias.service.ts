import axios from '@/config/axios'
import type { IParametroVigencia } from '../types/parametroVigencias.types'
const ENDPOINT = Object.freeze({
  PARAMETROVIGENCIA: '/parametro-vigencias',
  obtenerParametroVigencia() {
    return this.PARAMETROVIGENCIA + `/obtener`
  }
})

const obtenerParametroVigencia = async () => {
  const response = await axios
    .get<{ data: IParametroVigencia }>(`${ENDPOINT.obtenerParametroVigencia()}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  obtenerParametroVigencia
}
