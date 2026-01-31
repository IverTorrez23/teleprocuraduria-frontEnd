import axios from '@/config/axios'

import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ICategorias } from '../categorias.types'

const ENDPOINT = Object.freeze({
  CATEGORIAS: '/categorias',
  listarCategoria(id?: number) {
    return this.CATEGORIAS + `/listar/${id ? id : ''}`
  },
  deleteCategoria(id: number) {
    return this.CATEGORIAS + `/eliminar/${id}`
  }
})

const getCategorias = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICategorias[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CATEGORIAS, {
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
    console.error('Failed to fetch categorias', error)
    return CrearRespuestaPaginado()
  }
}

const createCategoria = async (categoria: Omit<ICategorias, 'id'>) => {
  const response = await axios
    .post<{ response: ICategorias }>(ENDPOINT.CATEGORIAS, categoria)
    .catch(() => undefined)

  return response?.data?.response
}

const updateCategoria = async (categoria: ICategorias) => {
  if (!categoria.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{ response: ICategorias }>(`${ENDPOINT.CATEGORIAS}/${categoria.id}`, categoria)
    .catch(() => undefined)

  return response?.data.response
}

const deleteCategoria = async (categoria: ICategorias) => {
  if (!categoria?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteCategoria(categoria.id)).catch(() => undefined)

  return !!response
}
const listarCategorias = async (id?: number) => {
  const response = await axios
    .get<{ data: ICategorias[] }>(`${ENDPOINT.listarCategoria(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  listarCategorias
}
