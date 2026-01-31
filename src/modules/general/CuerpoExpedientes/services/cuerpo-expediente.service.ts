import axios from '@/config/axios'
import { AxiosError, isAxiosError } from 'axios'
import type { ICuerpoExpediente } from '../types/cuerpo-expediente.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'

const ENDPOINT = Object.freeze({
  CUERPOEXPEDIENTE: '/cuerpo-expedientes',
  listarCuerpoExpediente() {
    return this.CUERPOEXPEDIENTE + `/listar`
  },
  deleteCuerpoExpediente(id: number) {
    return this.CUERPOEXPEDIENTE + `/eliminar/${id}`
  },
  obtenerUnCuerpoExpediente(id: number) {
    return this.CUERPOEXPEDIENTE + `/${id}`
  },
  listarExpedientesDigitalesDeTribunal(id?: number) {
    return this.CUERPOEXPEDIENTE + `/por-tribunal/${id ? id : ''}`
  },
})

const getCuerpoExpediente = async (
  options: IOpcionesPaginado,
  idTribunal:number
): Promise<{ pagination: IPaginado; result: ICuerpoExpediente[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CUERPOEXPEDIENTE + `/tribunal/listar/${idTribunal}`, {
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
    console.error('Failed to fetch Cuerpo Expediente', error)
    return CrearRespuestaPaginado()
  }
}

const listarCuerpoExpedientes = async () => {
  const response = await axios
    .get<{ data: ICuerpoExpediente[] }>(`${ENDPOINT.listarCuerpoExpediente()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerUnCuerpoExpediente = async (id: number) => {
  const response = await axios
    .get<{ data: ICuerpoExpediente }>(`${ENDPOINT.obtenerUnCuerpoExpediente(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const createCuerpoExpediente = async (formData: FormData) => {
    try {
      const response = await axios.post<{ response: ICuerpoExpediente }>(ENDPOINT.CUERPOEXPEDIENTE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.response;
    } catch (error) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string; errors: Record<string, string[]> }>;
        if (axiosError.response) {
          const errorMessage = axiosError.response.data.message;
          const errorDetails = axiosError.response.data.errors;
          console.error('Error en el registro:', errorMessage, errorDetails);
          
          throw new Error(errorMessage);
        }
      }
      throw new Error('Error desconocido al intentar registrar Expediente digital.');
    }
  }


const updateCuerpoExpediente = async (formData: FormData) => {
    try {
      const id = formData.get('id')
      if (!id) throw new Error('id es requerido')
      const response = await axios.post<{ response: ICuerpoExpediente }>(
        `${ENDPOINT.CUERPOEXPEDIENTE}/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      return response?.data.response
    } catch (error) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string; errors: Record<string, string[]> }>
        if (axiosError.response) {
          const errorMessage = axiosError.response.data.message
          const errorDetails = axiosError.response.data.errors
          console.error('Error al actualizar:', errorMessage, errorDetails)
  
          throw new Error(errorMessage)
        }
      }
      throw new Error('Error desconocido al intentar actualizar Expediente digital.')
    }
  }

const deleteCuerpoExpediente = async (cuerpoExpediente: ICuerpoExpediente) => {
  if (!cuerpoExpediente?.id) throw new Error('id es requerido')

  const response = await axios
    .patch(ENDPOINT.deleteCuerpoExpediente(cuerpoExpediente.id))
    .catch(() => undefined)

  return !!response
}
const listarExpedientesDigitalesDeTribunal = async (id?: number) => {
  const response = await axios
    .get<{ data: ICuerpoExpediente[] }>(`${ENDPOINT.listarExpedientesDigitalesDeTribunal(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

export default {
  getCuerpoExpediente,
  listarCuerpoExpedientes,
  createCuerpoExpediente,
  updateCuerpoExpediente,
  deleteCuerpoExpediente,
  obtenerUnCuerpoExpediente,
  listarExpedientesDigitalesDeTribunal
}
