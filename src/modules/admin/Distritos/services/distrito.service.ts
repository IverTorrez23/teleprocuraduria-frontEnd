import axios from '@/config/axios'
import type { IDistrito } from '../types/distrito.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  //DISTRITOS: '/distritos',
  DISTRITOS: '/distritos',
  listarDistrito(id?: number) {
    return this.DISTRITOS + `/listar/${id ? id : ''}`
  },
  deleteDistrito(id: number) {
    return this.DISTRITOS + `/eliminar/${id}`
  }
})

const getDistritos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDistrito[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DISTRITOS, {
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
    console.error('Failed to fetch distritos', error)
    return CrearRespuestaPaginado()
  }
}

const listarDistritos = async (id?: number) => {
  const response = await axios
    .get<{ data: IDistrito[] }>(`${ENDPOINT.listarDistrito(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createDistrito = async (distrito: Omit<IDistrito, 'id'>) => {
  const response = await axios
    .post<{ response: IDistrito }>(ENDPOINT.DISTRITOS, distrito)
    .catch(() => undefined)

  return response?.data?.response
}

const updateDistrito = async (distrito: IDistrito) => {
  if (!distrito.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IDistrito }>(`${ENDPOINT.DISTRITOS}/${distrito.id}`, distrito)
    .catch(() => undefined)

  return response?.data.response
}

const deleteDistrito = async (distrito: IDistrito) => {
  if (!distrito?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteDistrito(distrito.id)).catch(() => undefined)

  return !!response
}

export default {
  getDistritos,
  createDistrito,
  updateDistrito,
  deleteDistrito,
  listarDistritos
}
