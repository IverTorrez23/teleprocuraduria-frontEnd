import axios from '@/config/axios'
import type { IClaseTribunal } from '../types/clase-tribunal.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  CLASETRIBUNAL: '/clase-tribunal',
  listarClaseTribunal() {
    return this.CLASETRIBUNAL + `/activos/listar`
  },
  deleteClaseTribunal(id: number) {
    return this.CLASETRIBUNAL + `/eliminar/${id}`
  },
  obtenerUnClaseTribunal(id: number) {
    return this.CLASETRIBUNAL + `/${id}`
  }
})

const getClaseTribunal = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IClaseTribunal[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CLASETRIBUNAL, {
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
    console.error('Failed to fetch Clase Tribunal', error)
    return CrearRespuestaPaginado()
  }
}

const listarClaseTribunales = async () => {
  const response = await axios
    .get<{ data: IClaseTribunal[] }>(`${ENDPOINT.listarClaseTribunal()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnClaseTribunal = async (id: number) => {
  const response = await axios
    .get<{ data: IClaseTribunal }>(`${ENDPOINT.obtenerUnClaseTribunal(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createClaseTribunal = async (claseTribunal: Omit<IClaseTribunal, 'id'>) => {
  const response = await axios
    .post<{ response: IClaseTribunal }>(ENDPOINT.CLASETRIBUNAL, claseTribunal)
    .catch(() => undefined)

  return response?.data?.response
}

const updateClaseTribunal = async (claseTribunal: IClaseTribunal) => {
  if (!claseTribunal.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{
      response: IClaseTribunal
    }>(`${ENDPOINT.CLASETRIBUNAL}/${claseTribunal.id}`, claseTribunal)
    .catch(() => undefined)

  return response?.data.response
}

const deleteClaseTribunal = async (claseTribunal: IClaseTribunal) => {
  if (!claseTribunal?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteClaseTribunal(claseTribunal.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getClaseTribunal,
  listarClaseTribunales,
  createClaseTribunal,
  updateClaseTribunal,
  deleteClaseTribunal,
  obtenerUnClaseTribunal
}
