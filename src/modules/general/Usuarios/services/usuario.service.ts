import axios from '@/config/axios'
import type { IUsuario } from '../types/usuario.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import { handleAxiosResponse } from '@/common/utils/handleAxiosResponse'

const BASE = '/usuarios'

const ENDPOINT = {
  USUARIOS: BASE,
  CREAR_USUARIO: `${BASE}/crear`,
  listarUsuario: (id?: number) => `${BASE}/listar/${id ?? ''}`,
  listarAbogados: () => `${BASE}/abogados`,
  listarProcuradores: () => `${BASE}/procuradores`,
  deleteUsuario: (id: number) => `${BASE}/eliminar/${id}`,
  updateUsuario: (id: number) => `${BASE}/actualizar/${id}`,
  obtenerUnUsuarioById: (id: number) => `${BASE}/obtener-uno/${id}`,
  listarAbogadosDependientes: (abogadoLiderId: number) =>
    `${BASE}/abogados-dependientes/${abogadoLiderId}/paginado`
}

//no se ocupa
const getUsuariosPaginado = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IUsuario[] }> => {
  try {
    const response = await axios.get(ENDPOINT.USUARIOS, {
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
    console.error('Failed to fetch usuarios', error)
    return CrearRespuestaPaginado()
  }
}

// no se ocupa
const listarUsuarios = async (id?: number) => {
  const response = await axios
    .get<{ data: IUsuario[] }>(`${ENDPOINT.listarUsuario(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const crearUsuario = async (datos: IUsuario): Promise<ServiceResponse<null>> => {
  const request = axios.post(ENDPOINT.CREAR_USUARIO, datos)
  return handleAxiosResponse(request)
}

const updateUsuario = async (usuario: IUsuario): Promise<ServiceResponse<null>> => {
  if (!usuario.id) throw new Error('id es requerido')

  const request = axios.patch(`${ENDPOINT.updateUsuario(usuario.id)}`, usuario)
  return handleAxiosResponse(request)
}

const deleteUsuario = async (id: number): Promise<ServiceResponse<null>> => {
  const request = axios.delete(ENDPOINT.deleteUsuario(id))
  return handleAxiosResponse(request)
}
//si se ocupa
const listarUsuariosAbogados = async (): Promise<ServiceResponse<IUsuario[]>> => {
  try {
    const response = await axios.get<{ data: IUsuario[] }>(`${ENDPOINT.listarAbogados()}`)

    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        success: false,
        error: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      success: false,
      error: 'Error en la conexión o solicitud fallida.'
    }
  }
}

const listarUsuariosAbogadosDependientes = async (
  abogadoLiderId: number,
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IUsuario[] }> => {
  try {
    const request = await axios.get(ENDPOINT.listarAbogadosDependientes(abogadoLiderId), {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search),
        sort: JSON.stringify(options.sort)
      }
    })
    const data = request.data
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
    return CrearRespuestaPaginado()
  }
}

//si se ocupa
const listarUsuariosProcurador = async (): Promise<ServiceResponse<IUsuario[]>> => {
  try {
    const response = await axios.get<{ data: IUsuario[] }>(`${ENDPOINT.listarProcuradores()}`)

    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        success: false,
        error: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      success: false,
      error: 'Error en la conexión o solicitud fallida.'
    }
  }
}

const obtenerUnUsuarioById = async (id: number) => {
  try {
    const response = await axios.get<{ data: IUsuario }>(
      `${ENDPOINT.obtenerUnUsuarioById(id)}`
    )
    return response.data.data
  } catch (error: any) {
    // Si el backend envía un mensaje específico
    const mensajeError =
      error?.response?.data?.message || 'Error al obtener usuario.'
    throw new Error(mensajeError)
  }
}
export default {
  getUsuariosPaginado,
  listarUsuarios,
  crearUsuario,
  updateUsuario,
  deleteUsuario,
  listarUsuariosAbogados,
  listarUsuariosProcurador,
  listarUsuariosAbogadosDependientes,
  obtenerUnUsuarioById
}
