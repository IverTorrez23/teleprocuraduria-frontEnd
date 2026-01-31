import axios from '@/config/axios'
import axios2 from '@/config/axios2'
import { isAxiosError } from 'axios'
import type { ICausa } from '../types/causa.types'
import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import type { ICausaBilletera } from '../../Billetera/types/causaBilletera.types'
import type { ITribunalDominanteResponse } from '../types/causa.types'

const ENDPOINT = Object.freeze({
  CAUSAS: '/causas',
  listarCausa(id?: number) {
    return this.CAUSAS + `/listar/${id ? id : ''}`
  },
  deleteCausa(id: number) {
    return this.CAUSAS + `/eliminar/${id}`
  },
  obtenerUnaCausa(id: number) {
    return this.CAUSAS + `/${id}`
  },
  listadoSinPaquete() {
    return this.CAUSAS + `/listado/sin-paquete`
  },
  getCausasTerminadas() {
    return this.CAUSAS + `/listado/terminadas`
  },
  getCausasOrdenGiradas() {
    return this.CAUSAS + `/listado/orden-giradas`
  },
  getCausasOrdenPrePresupuestadas() {
    return this.CAUSAS + `/listado/orden-pre-presupuestadas`
  },
  getCausasOrdenPresupuestadas() {
    return this.CAUSAS + `/listado/orden-presupuestadas`
  },
  getCausasOrdenAceptadas() {
    return this.CAUSAS + `/listado/orden-aceptadas`
  },
  getCausasOrdenDineroEntregado() {
    return this.CAUSAS + `/listado/orden-dinero-entregado`
  },
  getCausasOrdenListaRealizar() {
    return this.CAUSAS + `/listado/orden-lista-realizar`
  },
  getCausasOrdenDescargadas() {
    return this.CAUSAS + `/listado/orden-descargadas`
  },
  getCausasOrdenPronuncioAbogado() {
    return this.CAUSAS + `/listado/orden-pronuncio-abogado`
  },
  getCausasOrdenCuentasConciliadas() {
    return this.CAUSAS + `/listado/orden-cuenta-conciliadas`
  },
  getCausasOrdenVencidasLeves() {
    return this.CAUSAS + `/listado/orden-vencidas-leves`
  },
  getCausasOrdenVencidasGraves() {
    return this.CAUSAS + `/listado/orden-vencidas-graves`
  },
  getCausasConBilleteras() {
    return this.CAUSAS + `/listado/con-billeteras/paginado`
  },
  listadoOrigenTransaccion() {
    return this.CAUSAS + `/listado/para-transaccion/origen`
  },
  listadoDestinoTransaccion() {
    return this.CAUSAS + `/listado/para-transaccion/destino`
  },
  listarCausasConBilleteraPorUsuario() {
    return this.CAUSAS + `/listado/billeteras/usuario`
  },
  getCausasOrdenGiradasDeLider() {
    return this.CAUSAS + `/listado/orden-giradas/lider`
  },
  getCausasOrdenPrePresupuestadasDeLider() {
    return this.CAUSAS + `/listado/orden-pre-presupuestadas/lider`
  },
  getCausasOrdenPresupuestadasDeLider() {
    return this.CAUSAS + `/listado/orden-presupuestadas/lider`
  },
  getCausasOrdenAceptadasDeLider() {
    return this.CAUSAS + `/listado/orden-aceptadas/lider`
  },
  getCausasOrdenDineroEntregadoDeLider() {
    return this.CAUSAS + `/listado/orden-dinero-entregado/lider`
  },
  getCausasOrdenListaRealizarDeLider() {
    return this.CAUSAS + `/listado/orden-lista-realizar/lider`
  },
  getCausasOrdenDescargadasDeLider() {
    return this.CAUSAS + `/listado/orden-descargadas/lider`
  },
  getCausasOrdenPronuncioAbogadoDeLider() {
    return this.CAUSAS + `/listado/orden-pronuncio-abogado/lider`
  },
  getCausasOrdenCuentasConciliadasDeLider() {
    return this.CAUSAS + `/listado/orden-cuenta-conciliadas/lider`
  },
  getCausasOrdenVencidasLevesDeLider() {
    return this.CAUSAS + `/listado/orden-vencidas-leves/lider`
  },
  getCausasOrdenVencidasGravesDeLider() {
    return this.CAUSAS + `/listado/orden-vencidas-graves/lider`
  },
  getCausasAdministrar() {
    return this.CAUSAS + `/lista/administrar`
  },
  obtenerDineroComprometidoDeCausa(id: number) {
    return this.CAUSAS + `/dinero-comprometido/${id}`
  },
  obtenerDineroComprometidoGeneral() {
    return this.CAUSAS + `/general-comprometido/saldos`
  },
  obtenerCausasPorCodigoLegal(id: number) {
    return this.CAUSAS + `/por-tipo-legal/${id}`
  },
  obtenerCausasPorAbogado(id: number) {
    return this.CAUSAS + `/por-abogado/${id}`
  },
  obtenerCausasPorCategoria(id: number) {
    return this.CAUSAS + `/por-categoria/${id}`
  },
  obtenerCausasPorProcurador(id: number) {
    return this.CAUSAS + `/por-procurador/${id}`
  },
  getCausasTodasCostosOperativos() {
    return this.CAUSAS + `/listado/costos-operativos`
  },
  listadoSaldosActivosCausas() {
    return this.CAUSAS + `/listado/saldos-activos`
  },
  listadoSaldosTerminadosCausas() {
    return this.CAUSAS + `/listado/saldos-terminados`
  },
  obtenerTribunalDominante(id: number) {
    return this.CAUSAS + `/datos-tribunal/${id}`
  },
})

const getCausas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.CAUSAS, {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasPorCodigoLegal = async (
  options: IOpcionesPaginado,
  codigoLegal:number
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerCausasPorCodigoLegal(codigoLegal), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasPorAbogado = async (
  options: IOpcionesPaginado,
  abogadoId:number
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerCausasPorAbogado(abogadoId), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasPorCategoria = async (
  options: IOpcionesPaginado,
  categoriaId:number
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerCausasPorCategoria(categoriaId), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasPorProcurador = async (
  options: IOpcionesPaginado,
  procuradorId:number
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.obtenerCausasPorProcurador(procuradorId), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const listarCausas = async (id?: number) => {
  const response = await axios
    .get<{ data: ICausa[] }>(`${ENDPOINT.listarCausa(id)}`)
    .catch(() => undefined)

  return response?.data.data
}

const obtenerUnaCausa = async (id: number) => {
  try {
    const response = await axios.get<{ data: ICausa }>(`${ENDPOINT.obtenerUnaCausa(id)}`);
    return response.data.data;
  } catch (error: any) {
    // Propagar el error al componente para que lo maneje
    throw error.response?.data || { message: 'Error desconocido' };
  }
};


const listadoSinPaquete = async () => {
  const response = await axios
    .get<{ data: ICausa[] }>(`${ENDPOINT.listadoSinPaquete()}`)
    .catch(() => undefined)
  return response?.data.data
}

const createCausa = async (causa: Omit<ICausa, 'id'>) => {
  try {
    const response = await axios2.post<{ response: ICausa }>(ENDPOINT.CAUSAS, causa)
    return response?.data?.data
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar registrar causa.')
  }
}

const updateCausa = async (causa: ICausa) => {
  if (!causa.id) throw new Error('id es requerido')
  try {
    const response = await axios2.patch<{ response: ICausa }>(
      `${ENDPOINT.CAUSAS}/${causa.id}`,
      causa
    )

    return response?.data.response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar actualizar registro')
  }
}

const deleteCausa = async (causa: ICausa) => {
  if (!causa?.id) throw new Error('id es requerido')
  try {
    const response = await axios2.patch(ENDPOINT.deleteCausa(causa.id))
    return !!response
  } catch (error) {
    if (isAxiosError(error)) {
      // No sobreescribimos el error aquí, ya viene formateado desde el interceptor
      throw error?.response?.data
    }
    throw new Error('Error al intentar eliminar causa')
  }
}

const getCausasTerminadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasTerminadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasTodasCostosOperativos = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasTodasCostosOperativos(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenGiradas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenGiradas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenPrePresupuestadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPrePresupuestadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenPresupuestadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPresupuestadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenAceptadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenAceptadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenDineroEntregado = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenDineroEntregado(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenListaRealizar = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenListaRealizar(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenDescargadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenDescargadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenPronuncioAbogado = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPronuncioAbogado(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenCuentasConciliadas = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenCuentasConciliadas(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenVencidasLeves = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenVencidasLeves(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenVencidasGraves = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenVencidasGraves(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}
//Listados de causas de ordenes del Lider
const getCausasOrdenGiradasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenGiradasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}
const getCausasOrdenPrePresupuestadasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPrePresupuestadasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenPresupuestadasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPresupuestadasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenAceptadasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenAceptadasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenDineroEntregadoDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenDineroEntregadoDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenListaRealizarDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenListaRealizarDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenDescargadasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenDescargadasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenPronuncioAbogadoDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenPronuncioAbogadoDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenCuentasConciliadasDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenCuentasConciliadasDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenVencidasLevesDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenVencidasLevesDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasOrdenVencidasGravesDeLider = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasOrdenVencidasGravesDeLider(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasAdministrar = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasAdministrar(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const getCausasConBilleteras = async (
  options: IOpcionesPaginado
): Promise<{ pagination: IPaginado; result: ICausa[] }> => {
  try {
    const response = await axios.get(ENDPOINT.getCausasConBilleteras(), {
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
    console.error('Failed to fetch causas', error)
    return CrearRespuestaPaginado()
  }
}

const listadoOrigenTransaccion = async (): Promise<ServiceResponse<ICausa[]>> => {
  try {
    const response = await axios.get<{ data: ICausa[] }>(`${ENDPOINT.listadoOrigenTransaccion()}`)

    return {
      status: 'success',
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        status: 'error',
        message: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}

const listadoDestinoTransaccion = async (): Promise<ServiceResponse<ICausa[]>> => {
  try {
    const response = await axios.get<{ data: ICausa[] }>(`${ENDPOINT.listadoDestinoTransaccion()}`)

    return {
      status: 'success',
      data: response.data.data
    }
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status
      const errorMessage = error.response.data.message || 'Error en la solicitud al servidor.'

      return {
        status: 'error',
        message: `Error ${statusCode}: ${errorMessage}`
      }
    }

    return {
      status: 'error',
      message: 'Error en la conexión o solicitud fallida.'
    }
  }
}

const listarCausasConBilleteraPorUsuario = async () => {
  const response = await axios
    .get<{ data: ICausaBilletera[] }>(`${ENDPOINT.listarCausasConBilleteraPorUsuario()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerDineroComprometidoDeCausa = async (id: number): Promise<number | undefined> => {
  try {
    const response = await axios.get<{ message: string; data: number }>(
      `${ENDPOINT.obtenerDineroComprometidoDeCausa(id)}`
    )
    return response.data.data
  } catch (error) {
    console.error('Error al obtener el dinero comprometido:', error)
    return undefined
  }
}
const obtenerDineroComprometidoGeneral = async (): Promise<number | undefined> => {
  try {
    const response = await axios.get<{ message: string; data: number }>(
      `${ENDPOINT.obtenerDineroComprometidoGeneral()}`
    )
    return response.data.data
  } catch (error) {
    console.error('Error al obtener el dinero comprometido general:', error)
    return undefined
  }
}

const listadoSaldosActivosCausas = async () => {
  const response = await axios
    .get<{ data: ICausa[] }>(`${ENDPOINT.listadoSaldosActivosCausas()}`)
    .catch(() => undefined)

  return response?.data.data
}
const listadoSaldosTerminadosCausas = async () => {
  const response = await axios
    .get<{ data: ICausa[] }>(`${ENDPOINT.listadoSaldosTerminadosCausas()}`)
    .catch(() => undefined)

  return response?.data.data
}

const obtenerTribunalDominante = async (
  causaId: number
): Promise<ITribunalDominanteResponse | undefined> => {
  try {
    const response = await axios.get<{ data: ITribunalDominanteResponse }>(
      ENDPOINT.obtenerTribunalDominante(causaId)
    )

    // Si tu backend no envuelve en "data", cambia a response.data directamente
    return response.data.data ?? response.data
  } catch (error) {
    console.error('Error al obtener tribunal dominante:', error)
    return undefined
  }
}

export default {
  getCausas,
  listarCausas,
  createCausa,
  updateCausa,
  deleteCausa,
  obtenerUnaCausa,
  listadoSinPaquete,
  getCausasTerminadas,
  getCausasOrdenGiradas,
  getCausasOrdenPrePresupuestadas,
  getCausasOrdenPresupuestadas,
  getCausasOrdenAceptadas,
  getCausasOrdenDineroEntregado,
  getCausasOrdenListaRealizar,
  getCausasOrdenDescargadas,
  getCausasOrdenPronuncioAbogado,
  getCausasOrdenCuentasConciliadas,
  getCausasOrdenVencidasLeves,
  getCausasOrdenVencidasGraves,
  getCausasConBilleteras,
  listadoOrigenTransaccion,
  listadoDestinoTransaccion,
  listarCausasConBilleteraPorUsuario,
  getCausasOrdenGiradasDeLider,
  getCausasOrdenPrePresupuestadasDeLider,
  getCausasOrdenPresupuestadasDeLider,
  getCausasOrdenAceptadasDeLider,
  getCausasOrdenDineroEntregadoDeLider,
  getCausasOrdenListaRealizarDeLider,
  getCausasOrdenDescargadasDeLider,
  getCausasOrdenPronuncioAbogadoDeLider,
  getCausasOrdenCuentasConciliadasDeLider,
  getCausasOrdenVencidasLevesDeLider,
  getCausasOrdenVencidasGravesDeLider,
  getCausasAdministrar,
  obtenerDineroComprometidoDeCausa,
  obtenerDineroComprometidoGeneral,
  getCausasPorCodigoLegal,
  getCausasPorAbogado,
  getCausasPorCategoria,
  getCausasPorProcurador,
  getCausasTodasCostosOperativos,
  listadoSaldosActivosCausas,
  listadoSaldosTerminadosCausas,
  obtenerTribunalDominante
}
