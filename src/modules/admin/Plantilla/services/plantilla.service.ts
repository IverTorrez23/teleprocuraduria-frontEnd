import axios from '@/config/axios'

import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { IPlantilla } from '../types/plantilla.types'

const ENDPOINT = Object.freeze({
  PLANTILLAS: '/avance-plantillas',
  listarPlantillas(id?: number) {
    return this.PLANTILLAS + `/listar/${id ? id : ''}`
  },

  listarPlantillaPorId(id: number) {
    return this.PLANTILLAS + `/listarPorId/${id}`
  },
  deletePlantilla(id: number) {
    return this.PLANTILLAS + `/eliminar/${id}`
  }
})

const getPlantillas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPlantilla[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PLANTILLAS, {
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
    console.error('Failed to fetch plantilla', error)
    return CrearRespuestaPaginado()
  }
}

const listarPlantillas = async (id?: number) => {
  const response = await axios
    .get<{ data: IPlantilla[] }>(`${ENDPOINT.listarPlantillas(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const listarPlantillaPorId = async (id: number) => {
  const response = await axios
    .get<{ data: IPlantilla[] }>(`${ENDPOINT.listarPlantillaPorId(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createPlantilla = async (plantilla: Omit<IPlantilla, 'id'>) => {
  const response = await axios
    .post<{ response: IPlantilla }>(ENDPOINT.PLANTILLAS, plantilla)
    .catch(() => undefined)

  return response?.data?.response
}

const updatePlantilla = async (plantilla: IPlantilla) => {
  if (!plantilla.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IPlantilla }>(`${ENDPOINT.PLANTILLAS}/${plantilla.id}`, plantilla)
    .catch(() => undefined)

  return response?.data.response
}

const deletePlantilla = async (plantilla: IPlantilla) => {
  if (!plantilla?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deletePlantilla(plantilla.id)).catch(() => undefined)

  return !!response
}

export default {
  getPlantillas,
  listarPlantillas,
  listarPlantillaPorId,
  createPlantilla,
  updatePlantilla,
  deletePlantilla
}
