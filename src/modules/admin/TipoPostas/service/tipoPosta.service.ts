import axios from '@/config/axios'
import type { ITipoPosta } from '../types/tipoPosta.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  TIPOPOSTAS: '/tipo-postas',
  listarTipoPostas() {
    return this.TIPOPOSTAS + `/listado`
  },
  deleteTipoPosta(id: number) {
    return this.TIPOPOSTAS + `/eliminar/${id}`
  }
})

const getTipoPostas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITipoPosta[] }> => {
  try {
    const response = await axios.get(ENDPOINT.TIPOPOSTAS, {
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
    console.error('Failed to fetch tipo postas', error)
    return CrearRespuestaPaginado()
  }
}

const listarTipoPostas = async () => {
  const response = await axios
    .get<{ data: ITipoPosta[] }>(`${ENDPOINT.listarTipoPostas()}`)
    .catch(() => undefined)

  return response?.data.data
}

const createTipoPosta = async (tipoPosta: Omit<ITipoPosta, 'id'>) => {
  const response = await axios
    .post<{ response: ITipoPosta }>(ENDPOINT.TIPOPOSTAS, tipoPosta)
    .catch(() => undefined)

  return response?.data?.response
}

const updateTipoPosta = async (tipoPosta: ITipoPosta) => {
  if (!tipoPosta.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: ITipoPosta }>(`${ENDPOINT.TIPOPOSTAS}/${tipoPosta.id}`, tipoPosta)
    .catch(() => undefined)

  return response?.data.response
}

const deleteTipoPosta = async (tipoPosta: ITipoPosta) => {
  if (!tipoPosta?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteTipoPosta(tipoPosta.id)).catch(() => undefined)

  return !!response
}

export default {
  getTipoPostas,
  listarTipoPostas,
  createTipoPosta,
  updateTipoPosta,
  deleteTipoPosta
}
