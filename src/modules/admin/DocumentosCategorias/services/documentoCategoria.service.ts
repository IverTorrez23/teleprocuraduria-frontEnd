import axios from '@/config/axios'
import type { IDocumentoCategoria } from '../types/documentosCategorias.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  DOCUMENTOSCATEGORIAS: '/documentos-categorias',
  listarDocCategoria(id?: number) {
    return this.DOCUMENTOSCATEGORIAS + `/listar/${id ? id : ''}`
  },
  listarSoloCategorias() {
    return this.DOCUMENTOSCATEGORIAS + `/categoria/listado`
  },
  listarSoloCategoriasTramites() {
    return this.DOCUMENTOSCATEGORIAS + `/tramites/listado`
  },
  listarSoloCategoriasNormas() {
    return this.DOCUMENTOSCATEGORIAS + `/normas/listado`
  },
  deleteDocCategoria(id: number) {
    return this.DOCUMENTOSCATEGORIAS + `/eliminar/${id}`
  },
  listarSubCategoriaPorCatId(id: number) {
    return this.DOCUMENTOSCATEGORIAS + `/subcategoria/listado/${id}`
  }
})

const getDocCategorias = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDocumentoCategoria[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DOCUMENTOSCATEGORIAS, {
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
    console.error('Failed to fetch documentos categorias', error)
    return CrearRespuestaPaginado()
  }
}

const getDocCategoriasTramites = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDocumentoCategoria[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DOCUMENTOSCATEGORIAS + '/tramites', {
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
    console.error('Failed to fetch documentos categorias tramites', error)
    return CrearRespuestaPaginado()
  }
}

const getDocCategoriasNormas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDocumentoCategoria[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DOCUMENTOSCATEGORIAS + '/normas', {
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
    console.error('Failed to fetch documentos categorias normas', error)
    return CrearRespuestaPaginado()
  }
}

const listarDocCategorias = async (id?: number) => {
  const response = await axios
    .get<{ data: IDocumentoCategoria[] }>(`${ENDPOINT.listarDocCategoria(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarSoloCategorias = async () => {
  const response = await axios
    .get<{ data: IDocumentoCategoria[] }>(`${ENDPOINT.listarSoloCategorias()}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarSoloCategoriasTramites = async () => {
  const response = await axios
    .get<{ data: IDocumentoCategoria[] }>(`${ENDPOINT.listarSoloCategoriasTramites()}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarSoloCategoriasNormas = async () => {
  const response = await axios
    .get<{ data: IDocumentoCategoria[] }>(`${ENDPOINT.listarSoloCategoriasNormas()}`)
    .catch(() => undefined)

  return response?.data.data
}

const listarSubCategorias = async (id: number) => {
  const response = await axios
    .get<{ data: IDocumentoCategoria[] }>(`${ENDPOINT.listarSubCategoriaPorCatId(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createDocCategoria = async (documentosCategoria: Omit<IDocumentoCategoria, 'id'>) => {
  const response = await axios
    .post<{ response: IDocumentoCategoria }>(ENDPOINT.DOCUMENTOSCATEGORIAS, documentosCategoria)
    .catch(() => undefined)

  return response?.data?.response
}

const updateDocCategoria = async (documentosCategoria: IDocumentoCategoria) => {
  if (!documentosCategoria.id) throw new Error('id es requerido')
  const response = await axios
    .patch<{
      response: IDocumentoCategoria
    }>(`${ENDPOINT.DOCUMENTOSCATEGORIAS}/${documentosCategoria.id}`, documentosCategoria)
    .catch(() => undefined)

  return response?.data.response
}

const deleteDocCategoria = async (documentosCategoria: IDocumentoCategoria) => {
  if (!documentosCategoria?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteDocCategoria(documentosCategoria.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getDocCategorias,
  getDocCategoriasTramites,
  getDocCategoriasNormas,
  listarDocCategorias,
  createDocCategoria,
  updateDocCategoria,
  deleteDocCategoria,
  listarSoloCategorias,
  listarSoloCategoriasTramites,
  listarSoloCategoriasNormas,
  listarSubCategorias
}
