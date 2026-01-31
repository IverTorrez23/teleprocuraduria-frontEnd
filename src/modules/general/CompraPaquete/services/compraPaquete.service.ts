import axios from '@/config/axios'
import axios2 from '@/config/axios2'
import { isAxiosError } from 'axios'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ICompraPaquete } from '../types/compraPaquete.types'

const ENDPOINT = Object.freeze({
  COMPRAPAQUETES: '/compra-paquetes',
  deleteCompraPaquete(id: number) {
    return this.COMPRAPAQUETES + `/eliminar/${id}`
  },
  obtenerUnaCompraPaquete(id: number) {
    return this.COMPRAPAQUETES + `/${id}`
  },
  listadoActivosPorUsuario() {
    return this.COMPRAPAQUETES + `/lista/activos`
  }
})

const getCompraPaquetes = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICompraPaquete[] }> => {
  try {
    const response = await axios.get(ENDPOINT.COMPRAPAQUETES, {
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
    console.error('Failed to fetch compra pquetes', error)
    return CrearRespuestaPaginado()
  }
}

const createCompraPaquete = async (compraPaquete: Omit<ICompraPaquete, 'id'>) => {
  try {
    const response = await axios2.post<{ response: ICompraPaquete }>(
      ENDPOINT.COMPRAPAQUETES,
      compraPaquete
    )
    return response?.data?.response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar realizar la compra.')
  }
}

const updateCompraPquete = async (compraPaquete: ICompraPaquete) => {
  if (!compraPaquete.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{
      response: ICompraPaquete
    }>(`${ENDPOINT.COMPRAPAQUETES}/${compraPaquete.id}`, compraPaquete)
    .catch(() => undefined)

  return response?.data.response
}

const deleteCompraPaquete = async (compraPaquete: ICompraPaquete) => {
  if (!compraPaquete?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteCompraPaquete(compraPaquete.id))
    .catch(() => undefined)

  return !!response
}
const obtenerUnaCompraPaquete = async (id: number) => {
  const response = await axios
    .get<{ data: ICompraPaquete }>(`${ENDPOINT.obtenerUnaCompraPaquete(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const listadoActivosPorUsuario = async () => {
  const response = await axios
    .get<{ data: ICompraPaquete[] }>(`${ENDPOINT.listadoActivosPorUsuario()}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getCompraPaquetes,
  createCompraPaquete,
  updateCompraPquete,
  deleteCompraPaquete,
  obtenerUnaCompraPaquete,
  listadoActivosPorUsuario
}
