import axios from '@/config/axios'
import type { ICausaPosta } from '../types/causaPosta.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  CAUSAPOSTA: '/causa-postas',
  listarCausaPosta(id: number) {
    return this.CAUSAPOSTA + `/litado/causa/${id}`
  },
  deleteCausaPosta(id: number) {
    return this.CAUSAPOSTA + `/eliminar/${id}`
  },
  deleteTodoAvanceFisicoPorCausa(id: number) {
    return this.CAUSAPOSTA + `/eliminar-todo/${id}`
  }
})

const getCausaPosta = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausaPosta[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CAUSAPOSTA, {
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
    console.error('Failed to fetch causa posta', error)
    return CrearRespuestaPaginado()
  }
}

const listarCausaPosta = async (id: number) => {
  const response = await axios
    .get<{ data: ICausaPosta[] }>(`${ENDPOINT.listarCausaPosta(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createCausaPosta = async (causaPosta: Omit<ICausaPosta, 'id'>) => {
  const response = await axios
    .post<{ response: ICausaPosta }>(ENDPOINT.CAUSAPOSTA, causaPosta)
    .catch(() => undefined)

  return response?.data?.response
}

const updateCausaPosta = async (causaPosta: ICausaPosta) => {
  if (!causaPosta.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: ICausaPosta }>(`${ENDPOINT.CAUSAPOSTA}/${causaPosta.id}`, causaPosta)
    .catch(() => undefined)

  return response?.data.response
}


const deleteCausaPosta = async (causaPosta: ICausaPosta) => {
  if (!causaPosta?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteCausaPosta(causaPosta.id))
    .catch(() => undefined)

  return !!response
}
const deleteTodoAvanceFisicoPorCausa = async (causaId: number) => {
  if (!causaId) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteTodoAvanceFisicoPorCausa(causaId))
    .catch(() => undefined)

  return !!response
}



export default {
  getCausaPosta,
  listarCausaPosta,
  createCausaPosta,
  updateCausaPosta,
  deleteCausaPosta,
  deleteTodoAvanceFisicoPorCausa
}
