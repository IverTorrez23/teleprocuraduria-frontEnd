import axios from '@/config/axios'
//import type { IDocumentoCategoria } from '../types/documentosCategorias.types'
import type { IDocumento } from '../types/documento.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  DOCUMENTOS: '/documentos',
  listarDocumento(id?: number) {
    return this.DOCUMENTOS + `/listar/${id ? id : ''}`
  },
  deleteDocumento(id: number) {
    return this.DOCUMENTOS + `/eliminar/${id}`
  },
  listadoDocNormasDeCategoria(categoriaId: number) {
    return this.DOCUMENTOS + `/listado/normas/categoria/${categoriaId}`
  },
  listadoDocTramtesDeCategoria(categoriaId: number) {
    return this.DOCUMENTOS + `/listado/tramites/categoria/${categoriaId}`
  }
})

const getDocumentosTramites = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDocumento[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DOCUMENTOS + '/tramites', {
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
    console.error('Failed to fetch documentos tramites', error)
    return CrearRespuestaPaginado()
  }
}
const getDocumentosNormas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDocumento[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DOCUMENTOS + '/normas', {
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
    console.error('Failed to fetch documentos normas', error)
    return CrearRespuestaPaginado()
  }
}

const listarDocumentos = async (id?: number) => {
  const response = await axios
    .get<{ data: IDocumento[] }>(`${ENDPOINT.listarDocumento(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createDocumento = async (formData: FormData) => {
  const formDataObj: any = {}
  formData.forEach((value, key) => {
    formDataObj[key] = value
  })
  console.log('formData carga create', formDataObj)
  const response = await axios
    .post<{ response: IDocumento }>(ENDPOINT.DOCUMENTOS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .catch(() => undefined)

  return response?.data?.response
}

const updateDocumento = async (formData: FormData) => {
  const id = formData.get('id')
  if (!id) throw new Error('id es requerido')

  const formDataObj: any = {}
  formData.forEach((value, key) => {
    formDataObj[key] = value
  })
  console.log('formData carga update', formDataObj)

  const response = await axios
    .post<{ response: IDocumento }>(`${ENDPOINT.DOCUMENTOS}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .catch(() => undefined)

  return response?.data.response
}

const deleteDocumento = async (documento: IDocumento) => {
  if (!documento?.id) throw new Error('id es requerido')

  const response = await axios.patch(ENDPOINT.deleteDocumento(documento.id)).catch(() => undefined)

  return !!response
}

const listadoDocNormasDeCategoria = async (categoriaId: number) => {
  const response = await axios
    .get<{ data: IDocumento[] }>(`${ENDPOINT.listadoDocNormasDeCategoria(categoriaId)}`)
    .catch(() => undefined)

  return response?.data.data
}

const listadoDocTramtesDeCategoria = async (categoriaId: number) => {
  const response = await axios
    .get<{ data: IDocumento[] }>(`${ENDPOINT.listadoDocTramtesDeCategoria(categoriaId)}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getDocumentosTramites,
  getDocumentosNormas,
  listarDocumentos,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  listadoDocNormasDeCategoria,
  listadoDocTramtesDeCategoria
}
