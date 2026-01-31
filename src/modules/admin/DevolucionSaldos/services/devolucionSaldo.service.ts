import axios from '@/config/axios'
import type { IDevolucionSaldo } from '../types/devolucionSaldo.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
const ENDPOINT = Object.freeze({
  DEVOLUCIONSALDO: '/devolucion-saldo',
  deleteDevolucionSaldo(id: number) {
    return this.DEVOLUCIONSALDO + `/eliminar/${id}`
  }
})

const getDevolucionesSaldo = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IDevolucionSaldo[] }> => {
  try {
    const response = await axios.get(ENDPOINT.DEVOLUCIONSALDO, {
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
    console.error('Failed to fetch devoluciones', error)
    return CrearRespuestaPaginado()
  }
}

const createDevolucionSaldo = async (devolucionSaldo: Omit<IDevolucionSaldo, 'id'>) => {
  try {
    if (!devolucionSaldo.billetera_id) {
      throw new Error('Debe seleccionar una billetera del abogado.')
    }
    const response = await axios.post<{ response: IDevolucionSaldo }>(
      ENDPOINT.DEVOLUCIONSALDO,
      devolucionSaldo
    )
    return response?.data.response
  } catch (error: any) {
    // Si el error es de axios (respuesta del backend con error)
    if (error?.response?.data?.message) {
      throw error.response.data.message
    }

    // Si es un error que tú lanzaste localmente
    if (error instanceof Error) {
      throw error.message
    }

    // Error desconocido
    throw 'Error al hacer devolución'
  }
}

const deleteDevolucionSaldo = async (devolucionSaldo: IDevolucionSaldo) => {
  if (!devolucionSaldo?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteDevolucionSaldo(devolucionSaldo.id))
    .catch(() => undefined)

  return !!response
}

export default {
  getDevolucionesSaldo,
  createDevolucionSaldo,
  deleteDevolucionSaldo
}
