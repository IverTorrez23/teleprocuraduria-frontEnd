import axios from '@/config/axios'
import type { IPresupuesto } from '../types/presupuesto.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  PRESUPUESTOS: '/presupuestos',
  deletePresupuesto(id: number) {
    return this.PRESUPUESTOS + `/eliminar/${id}`
  },
  obtenerUnPresupuesto(id: number) {
    return this.PRESUPUESTOS + `/${id}`
  },
  entregarPresupuesto(id: number) {
    return this.PRESUPUESTOS + `/entregar/${id}`
  },
  entregarPresupuestosMasivo() {
    return this.PRESUPUESTOS + `/entregar-masivo`
  }
})

const getPresupuestos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: IPresupuesto[] }> => {
  try {
    const response = await axios.get(ENDPOINT.PRESUPUESTOS, {
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
    console.error('Failed to fetch presupuestos', error)
    return CrearRespuestaPaginado()
  }
}

const obtenerUnPresupuesto = async (id: number) => {
  const response = await axios
    .get<{ data: IPresupuesto }>(`${ENDPOINT.obtenerUnPresupuesto(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createPresupuesto = async (presupuesto: Omit<IPresupuesto, 'id'>) => {
  try {
    const response = await axios.post<{ response: IPresupuesto }>(
      ENDPOINT.PRESUPUESTOS,
      presupuesto
    )
    return response.data.response
  } catch (error: any) {
    // Relanzamos el mensaje del backend si existe
    throw error.response?.data?.message || 'Error desconocido al crear presupuesto.'
  }
}

const updatePresupuesto = async (presupuesto: IPresupuesto) => {
  if (!presupuesto.id) throw new Error('ID es requerido')

  try {
    const response = await axios.patch<{ response: IPresupuesto }>(
      `${ENDPOINT.PRESUPUESTOS}/${presupuesto.id}`,
      presupuesto
    )

    return response.data.response
  } catch (error: any) {
    // Lanza el mensaje que venga del backend, o un mensaje genérico si no hay
    throw error.response?.data?.message || 'Error al actualizar el presupuesto.'
  }
}

const deletePresupuesto = async (presupuesto: IPresupuesto) => {
  if (!presupuesto?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deletePresupuesto(presupuesto.id))
    .catch(() => undefined)

  return !!response
}
const entegarPresupuesto = async (presupuesto: IPresupuesto) => {
  if (!presupuesto?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.entregarPresupuesto(presupuesto.id))
    .catch(() => undefined)
  return !!response
}
const entregarPresupuestosMasivo = async (
  presupuestos: IPresupuesto[]
): Promise<{ message: string }> => {
  if (!Array.isArray(presupuestos) || presupuestos.length === 0) {
    throw new Error('Debe seleccionar al menos un presupuesto para la entrega masiva.')
  }

  try {
    // Asume que ENDPOINT.ENTREGAR_MASIVO === '/presupuestos/entregar-masivo'
    const response = await axios.post<{ message: string }>(
      ENDPOINT.entregarPresupuestosMasivo(),
      presupuestos
    )
    return response.data
  } catch (error: any) {
    // Si el backend envía un mensaje en error.response.data.message, lo lanzamos
    throw error.response?.data?.message || 'Error al entregar presupuestos masivos.'
  }
}

export default {
  getPresupuestos,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  obtenerUnPresupuesto,
  entegarPresupuesto,
  entregarPresupuestosMasivo
}
