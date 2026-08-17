import axios from '@/config/axios'
import { isAxiosError } from 'axios'

import type { ICupon, IGenerarCuponesLote, IRespuestaCuponesLote } from '../types/cupon.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  CUPON: '/cupon',

  listarCupones() {
    return `${this.CUPON}/listar-activos`
  },

  updateCupon(id: number) {
    return `${this.CUPON}/${id}`
  },

  deleteCupon(id: number) {
    return `${this.CUPON}/eliminar/${id}`
  }
})

interface ApiResponse<T> {
  status?: 'success' | 'error'
  message: string
  data: T
  errors?: Record<string, string[] | string> | null
}

interface CuponPaginationResponse {
  data: ICupon[]
  meta: {
    per_page: number
    total: number
    to: number | null
    current_page: number
  }
}

/**
 * Convierte cualquier error en un Error con mensaje legible.
 */
const procesarError = (error: unknown, mensajePredeterminado: string): Error => {
  if (isAxiosError(error)) {
    const backendData = error.response?.data as
      | {
          message?: string
          error?: string
          errors?: Record<string, string[] | string>
        }
      | undefined

    const mensajesValidacion = backendData?.errors
      ? Object.values(backendData.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .join(' ')
      : ''

    const mensaje = [backendData?.message, backendData?.error, mensajesValidacion]
      .filter(Boolean)
      .join(' - ')

    if (mensaje) {
      return new Error(mensaje)
    }

    if (!error.response) {
      return new Error('No se pudo establecer conexión con el servidor.')
    }

    return new Error(`Error ${error.response.status}: ${mensajePredeterminado}`)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(mensajePredeterminado)
}

const getCupones = async (
  options: IOpcionesPaginado
): Promise<{
  pagination: IPaginado
  result: ICupon[]
}> => {
  try {
    const response = await axios.get<CuponPaginationResponse>(ENDPOINT.CUPON, {
      params: {
        page: options.page,
        perPage: options.perPage,
        search: JSON.stringify(options.search ?? []),
        sort: JSON.stringify(options.sort ?? [])
      }
    })

    const { data, meta } = response.data

    const pagination: IPaginado = {
      rowsPerPage: meta.per_page,
      rowsNumber: meta.total,
      totalItems: meta.total,
      itemCount: meta.to ?? 0,
      perPage: meta.per_page,
      currentPage: meta.current_page
    }

    return {
      pagination,
      result: data
    }
  } catch (error: unknown) {
    throw procesarError(error, 'No se pudieron obtener los cupones.')
  }
}

const getCuponesDePaquete = async (
  options: IOpcionesPaginado,
  idPaquete: number
): Promise<{ pagination: IPaginado; result: ICupon[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CUPON + `/paquete/${idPaquete}`, {
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
    console.error('Failed to fetch cupones', error)
    return CrearRespuestaPaginado()
  }
}

const listarCupones = async (): Promise<ICupon[]> => {
  try {
    const response = await axios.get<ApiResponse<ICupon[]>>(ENDPOINT.listarCupones())

    return response.data.data
  } catch (error: unknown) {
    throw procesarError(error, 'No se pudieron listar los cupones.')
  }
}

const createCupon = async (cupon: Omit<ICupon, 'id'>): Promise<ICupon> => {
  try {
    const response = await axios.post<ApiResponse<ICupon>>(ENDPOINT.CUPON, cupon)

    return response.data.data
  } catch (error: unknown) {
    throw procesarError(error, 'No se pudo crear el cupón.')
  }
}

const updateCupon = async (cupon: ICupon): Promise<ICupon> => {
  if (!cupon.id) {
    throw new Error('El ID del cupón es requerido.')
  }

  try {
    const response = await axios.patch<ApiResponse<ICupon>>(ENDPOINT.updateCupon(cupon.id), cupon)

    return response.data.data
  } catch (error: unknown) {
    throw procesarError(error, 'No se pudo actualizar el cupón.')
  }
}

const deleteCupon = async (cupon: ICupon): Promise<ICupon> => {
  if (!cupon.id) {
    throw new Error('El ID del cupón es requerido.')
  }

  try {
    const response = await axios.patch<ApiResponse<ICupon>>(ENDPOINT.deleteCupon(cupon.id))

    return response.data.data
  } catch (error: unknown) {
    throw procesarError(error, 'No se pudo eliminar el cupón.')
  }
}

const generarCuponesLote = async (datos: IGenerarCuponesLote): Promise<IRespuestaCuponesLote> => {
  try {
    const response = await axios.post<IRespuestaCuponesLote>(
      ENDPOINT.CUPON + '/generar-lote',
      datos
    )

    return response.data
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('No se pudieron generar los cupones.')
  }
}

const canjearCupon = async (
  codigo: string,
  paqueteId: number
) => {
  try {
    const response = await axios.post(ENDPOINT.CUPON + `/canjear`, {
      codigo,
      paquete_id: paqueteId
    })

    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const mensajeBackend = error.response?.data?.message

      if (!error.response) {
        throw new Error(
          'No se pudo conectar con el servidor. Verifique su conexión.'
        )
      }

      if (error.response.status === 401) {
        throw new Error(
          mensajeBackend ||
            'Debe iniciar sesión para canjear el cupón.'
        )
      }

      if (error.response.status === 404) {
        throw new Error(
          mensajeBackend ||
            'El cupón ingresado no existe o no corresponde a este paquete.'
        )
      }

      if (error.response.status === 422) {
        throw new Error(
          mensajeBackend ||
            'El cupón ingresado no se encuentra disponible.'
        )
      }

      throw new Error(
        mensajeBackend ||
          'No se pudo canjear el cupón.'
      )
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error(
      'Ocurrió un error inesperado al canjear el cupón.'
    )
  }
}

export default {
  getCupones,
  listarCupones,
  createCupon,
  updateCupon,
  deleteCupon,
  getCuponesDePaquete,
  generarCuponesLote,
  canjearCupon
}
