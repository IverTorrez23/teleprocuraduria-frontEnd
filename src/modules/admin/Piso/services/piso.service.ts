import axios from '@/config/axios'
import type { IPiso } from '../types/piso.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  //PISOS: '/pisos',
  PISOS: '/pisos',
  listarPiso(id?: number) {
    return this.PISOS + `/listar/${id ? id : ''}`
  },
  deletePiso(id: number) {
    return this.PISOS + `/eliminar/${id}`
  }
})

const getPisos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPiso[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PISOS, {
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
    console.error('Failed to fetch pisos', error)
    return CrearRespuestaPaginado()
  }
}
const listarPisos = async (id?: number) => {
  const response = await axios
    .get<{ data: IPiso[] }>(`${ENDPOINT.listarPiso(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const createPiso = async (piso: Omit<IPiso, 'id'>) => {
  const response = await axios
    .post<{ response: IPiso }>(ENDPOINT.PISOS, piso)
    .catch(() => undefined)

  return response?.data?.response
}

const updatePiso = async (piso: IPiso) => {
  if (!piso.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IPiso }>(`${ENDPOINT.PISOS}/${piso.id}`, piso)
    .catch(() => undefined)

  return response?.data.response
}

const deletePiso = async (piso: IPiso) => {
  if (!piso?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deletePiso(piso.id)).catch(() => undefined)

  return !!response
}

export default {
  getPisos,
  createPiso,
  updatePiso,
  deletePiso,
  listarPisos
}
