import axios from '@/config/axios'

import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { IPosta } from '../types/posta.types'

const ENDPOINT = Object.freeze({
  POSTA: '/postas',
  listarPostas(id?: number) {
    return this.POSTA + `/listar/${id ? id : ''}`
  },
  listarPostasPorId(id: number) {
    return this.POSTA + `/listarPorId/${id}`
  },
  deletePosta(id: number) {
    return this.POSTA + `/eliminar/${id}`
  }
})

const getPostas = async (
  options: IOpcionesPaginado,
  idPlantilla?: number
): Promise<{ pagination: IPaginado; result: IPosta[] }> => {
  try {
    const response = await axios.get(
      idPlantilla ? ENDPOINT.listarPostasPorId(idPlantilla) : ENDPOINT.POSTA,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )

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
    console.error('Failed to fetch posta', error)
    return CrearRespuestaPaginado()
  }
}

const listarPosta = async (id?: number) => {
  const response = await axios
    .get<{ data: IPosta[] }>(`${ENDPOINT.listarPostas(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createPosta = async (posta: Omit<IPosta, 'id'>) => {
  const response = await axios
    .post<{ response: IPosta }>(ENDPOINT.POSTA, posta)
    .catch(() => undefined)

  return response?.data?.response
}

const updatePosta = async (posta: IPosta) => {
  if (!posta.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IPosta }>(`${ENDPOINT.POSTA}/${posta.id}`, posta)
    .catch(() => undefined)

  return response?.data.response
}

const deletePosta = async (posta: IPosta) => {
  if (!posta?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deletePosta(posta.id)).catch(() => undefined)

  return !!response
}

export default {
  getPostas,
  listarPosta,
  createPosta,
  updatePosta,
  deletePosta
}
