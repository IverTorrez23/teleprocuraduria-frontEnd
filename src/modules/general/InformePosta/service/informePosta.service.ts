import axios from '@/config/axios'
import type { IInformePosta } from '../types/informePosta.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  INFORMEPOSTA: '/informe-postas',
  listarInformePosta(id: number) {
    return this.INFORMEPOSTA + `/litado/causa/${id}`
  },
  deleteInformePosta(id: number) {
    return this.INFORMEPOSTA + `/eliminar/${id}`
  },
  deleteTruncamiento(id: number) {
    return this.INFORMEPOSTA + `/delete-truncamiento/${id}`
  }
})

const getInformePosta = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IInformePosta[] }> => {
  try {
    const response = await axios.get(ENDPOINT.INFORMEPOSTA, {
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
    console.error('Failed to fetch informe posta', error)
    return CrearRespuestaPaginado()
  }
}

const listarInformePosta = async (id: number) => {
  const response = await axios
    .get<{ data: IInformePosta[] }>(`${ENDPOINT.listarInformePosta(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createInformePosta = async (informePosta: Omit<IInformePosta, 'id'>) => {
  const response = await axios
    .post<{ response: IInformePosta }>(ENDPOINT.INFORMEPOSTA, informePosta)
    .catch(() => undefined)

  return response?.data?.response
}

const updateInformePosta = async (informePosta: IInformePosta) => {
  if (!informePosta.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IInformePosta }>(`${ENDPOINT.INFORMEPOSTA}/${informePosta.id}`, informePosta)
    .catch(() => undefined)

  return response?.data.response
}

const deleteInformePosta = async (informePosta: IInformePosta) => {
  if (!informePosta?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteInformePosta(informePosta.id))
    .catch(() => undefined)

  return !!response
}

const deleteTruncamiento = async (informePosta: IInformePosta) => {
  if (!informePosta?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteTruncamiento(informePosta.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getInformePosta,
  listarInformePosta,
  createInformePosta,
  updateInformePosta,
  deleteInformePosta,
  deleteTruncamiento
}
