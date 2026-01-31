import axios from '@/config/axios'
import type { IPaqueteCausa } from '../types/paqueteCausa.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  PAQUETECAUSAS: '/paquete-causas',
  listarPaqueteCausas() {
    return this.PAQUETECAUSAS + `/listar`
  },
  deletePaqueteCausa(id: number) {
    return this.PAQUETECAUSAS + `/eliminar/${id}`
  },
  listarActivosPorCompraPaquete(compraPaqueteId: number) {
    return this.PAQUETECAUSAS + `/listado/compra-pquete/${compraPaqueteId}`
  }
})

const getPaqueteCausa = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPaqueteCausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PAQUETECAUSAS, {
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
    console.error('Failed to fetch paquete causas', error)
    return CrearRespuestaPaginado()
  }
}

const listarPaqueteCausas = async () => {
  const response = await axios
    .get<{ data: IPaqueteCausa[] }>(`${ENDPOINT.listarPaqueteCausas()}`)
    .catch(() => undefined)

  return response?.data.data
}

const createPaqueteCausa = async (paqueteCausa: Omit<IPaqueteCausa, 'id'>) => {
  const response = await axios
    .post<{ response: IPaqueteCausa }>(ENDPOINT.PAQUETECAUSAS, paqueteCausa)
    .catch(() => undefined)

  return response?.data?.response
}

const updatePaqueteCausa = async (paqueteCausa: IPaqueteCausa) => {
  if (!paqueteCausa.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{
      response: IPaqueteCausa
    }>(`${ENDPOINT.PAQUETECAUSAS}/${paqueteCausa.id}`, paqueteCausa)
    .catch(() => undefined)

  return response?.data.response
}

const deletePaqueteCausa = async (paqueteCausa: IPaqueteCausa) => {
  if (!paqueteCausa?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deletePaqueteCausa(paqueteCausa.id))
    .catch(() => undefined)

  return !!response
}

const listarActivosPorCompraPaquete = async (idCompraPaquete: number) => {
  const response = await axios
    .get<{ data: IPaqueteCausa[] }>(`${ENDPOINT.listarActivosPorCompraPaquete(idCompraPaquete)}`)
    .catch(() => undefined)
  return response?.data.data
}

export default {
  getPaqueteCausa,
  listarPaqueteCausas,
  createPaqueteCausa,
  updatePaqueteCausa,
  deletePaqueteCausa,
  listarActivosPorCompraPaquete
}
