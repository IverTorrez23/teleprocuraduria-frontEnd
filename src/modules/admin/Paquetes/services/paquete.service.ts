import axios from '@/config/axios'
import type { IPaquete } from '../types/paquete.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  PAQUETES: '/paquetes',
  listarPaquetes() {
    return this.PAQUETES + `/listado`
  },
  deletePaquete(id: number) {
    return this.PAQUETES + `/eliminar/${id}`
  },
  obtenerUnPaquete(id: number) {
    return this.PAQUETES + `/${id}`
  },
  listarPaquetesSegunUsuario() {
    return this.PAQUETES + `/listado/segun-usuario`
  },
})

const getPaquetes = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPaquete[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PAQUETES, {
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
    console.error('Failed to fetch paquetes', error)
    return CrearRespuestaPaginado()
  }
}

const listarPaquetes = async () => {
  const response = await axios
    .get<{ data: IPaquete[] }>(`${ENDPOINT.listarPaquetes()}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarPaquetesSegunUsuario = async () => {
  const response = await axios
    .get<{ data: IPaquete[] }>(`${ENDPOINT.listarPaquetesSegunUsuario()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnPaquete = async (id: number) => {
    const response = await axios
      .get<{ data: IPaquete }>(`${ENDPOINT.obtenerUnPaquete(id)}`)
      .catch(() => undefined)
  
    return response?.data.data
  }

const createPaquete = async (paquete: Omit<IPaquete, 'id'>) => {
  const response = await axios
    .post<{ response: IPaquete }>(ENDPOINT.PAQUETES, paquete)
    .catch(() => undefined)

  return response?.data?.response
}

const updatePaquete = async (paquete: IPaquete) => {
  if (!paquete.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IPaquete }>(`${ENDPOINT.PAQUETES}/${paquete.id}`, paquete)
    .catch(() => undefined)

  return response?.data.response
}

const deletePaquete = async (paquete: IPaquete) => {
  if (!paquete?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deletePaquete(paquete.id)).catch(() => undefined)

  return !!response
}

export default {
  getPaquetes,
  createPaquete,
  updatePaquete,
  deletePaquete,
  listarPaquetes,
  obtenerUnPaquete,
  listarPaquetesSegunUsuario
}
