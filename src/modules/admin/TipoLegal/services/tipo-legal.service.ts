import axios from '@/config/axios'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ITipoLegal } from '../tipo-lega.types'
import type { ICodigosCausa } from '@/modules/general/Causas/types/codigos.types'

const ENDPOINT = Object.freeze({
  TIPOLEGAL: '/tipo-legal',
  listarTipoLegalPorMateriaId(id?: number) {
    return this.TIPOLEGAL + `/materia/${id}`
  },
  deleteTipoLegal(id: number) {
    return this.TIPOLEGAL + `/eliminar/${id}`
  },
  listarTipoLegalConMateria() {
    return this.TIPOLEGAL + `/listado-con-materia`
  },
})

const getTipoLegal = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ITipoLegal[] }> => {
  try {
    const response = await axios.get(ENDPOINT.TIPOLEGAL, {
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
    console.error('Failed to fetch tipo legal', error)
    return CrearRespuestaPaginado()
  }
}

const createTipoLegal = async (tipoLegal: Omit<ITipoLegal, 'id'>) => {
  const response = await axios
    .post<{ response: ITipoLegal }>(ENDPOINT.TIPOLEGAL, tipoLegal)
    .catch(() => undefined)

  return response?.data?.response
}

const updateTipoLegal = async (tipoLegal: ITipoLegal) => {
  if (!tipoLegal.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: ITipoLegal }>(`${ENDPOINT.TIPOLEGAL}/${tipoLegal.id}`, tipoLegal)
    .catch(() => undefined)

  return response?.data.response
}

const deleteTipoLegal = async (tipoLegal: ITipoLegal) => {
  if (!tipoLegal?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteTipoLegal(tipoLegal.id)).catch(() => undefined)

  return !!response
}

const listarTipoLegasPorMateriaId = async (id: number) => {
  const response = await axios
    .get<{ data: ITipoLegal[] }>(`${ENDPOINT.listarTipoLegalPorMateriaId(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const listarTipoLegalConMateria = async () => {
  const response = await axios
    .get<{ data: ICodigosCausa[] }>(`${ENDPOINT.listarTipoLegalConMateria()}`)
    .catch(() => undefined)

  return response?.data
}

export default {
  getTipoLegal,
  createTipoLegal,
  updateTipoLegal,
  deleteTipoLegal,
  listarTipoLegasPorMateriaId,
  listarTipoLegalConMateria
}
