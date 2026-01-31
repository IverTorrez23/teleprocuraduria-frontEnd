import axios from '@/config/axios'
import type { IMateria } from '../materia.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  MATERIAS: '/materias',
  listarMateria(id?: number) {
    return this.MATERIAS + `/listar/${id ? id : ''}`
  },
  deleteMateria(id: number) {
    return this.MATERIAS + `/eliminar/${id}`
  }
})

const getMaterias = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IMateria[] }> => {
  try {
    const response = await axios.get(ENDPOINT.MATERIAS, {
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
    console.error('Failed to fetch materias', error)
    return CrearRespuestaPaginado()
  }
}

const listarMaterias = async (id?: number) => {
  const response = await axios
    .get<{ data: IMateria[] }>(`${ENDPOINT.listarMateria(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createMateria = async (materia: Omit<IMateria, 'id'>) => {
  const response = await axios
    .post<{ response: IMateria }>(ENDPOINT.MATERIAS, materia)
    .catch(() => undefined)

  return response?.data?.response
}

const updateMateria = async (materia: IMateria) => {
  if (!materia.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: IMateria }>(`${ENDPOINT.MATERIAS}/${materia.id}`, materia)
    .catch(() => undefined)

  return response?.data.response
}

const deleteMateria = async (materia: IMateria) => {
  if (!materia?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteMateria(materia.id)).catch(() => undefined)

  return !!response
}

export default {
  getMaterias,
  listarMaterias,
  createMateria,
  updateMateria,
  deleteMateria
}
