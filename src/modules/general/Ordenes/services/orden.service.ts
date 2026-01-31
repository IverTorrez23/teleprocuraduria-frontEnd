import axios from '@/config/axios'

import type { IOpcionesPaginado, IPaginado } from '@/common/common.types'
import { CrearRespuestaPaginado } from '@/common/utils/respuestas-paginado'
import type { IOrden } from '../types/orden.types'
import type { ICantidadEtapasOrden } from '../types/cantidadEtapasOrden.types'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import type { IDetalleFinanciero } from '../types/orden.types'

const ENDPOINT = Object.freeze({
  ORDEN: '/orden',
  listarPorCausa(id?: number) {
    return this.ORDEN + `/listar-por-causa/${id ? id : ''}`
  },
  listarPorCausaDeProcurador(causaId: number, procuradorId: number) {
    return this.ORDEN + `/listar-por-causa/${causaId}/procurador/${procuradorId}`
  },
  listadoParaEntregarPresupuesto(id: number) {
    return this.ORDEN + `/listado/entregar-presupuesto/procurador/${id}`
  },
  listadoParaDevolverPresupuesto(id: number) {
    return this.ORDEN + `/listado/devolver-presupuesto/procurador/${id}`
  },
  listarSinCostoJudicialVenta() {
    return this.ORDEN + `/listado/sin-costojudicial-venta/admin`
  },
  obtenerCantidadEtapasOrden() {
    return this.ORDEN + `/cantidad-orden-etapas`
  },
  listarPorCausaGiradas(causaId: number) {
    return this.ORDEN + `/giradas/causa/${causaId}`
  },
  listarPorCausaPrePresupuestadas(causaId: number) {
    return this.ORDEN + `/pre-presupuestadas/causa/${causaId}`
  },
  listarPorCausaPresupuestadas(causaId: number) {
    return this.ORDEN + `/presupuestadas/causa/${causaId}`
  },
  listarPorCausaAceptadas(causaId: number) {
    return this.ORDEN + `/aceptadas/causa/${causaId}`
  },
  listarPorCausaDineroEntregado(causaId: number) {
    return this.ORDEN + `/dinero-entregado/causa/${causaId}`
  },
  listarPorCausaListaRealizar(causaId: number) {
    return this.ORDEN + `/lista-realizar/causa/${causaId}`
  },
  listarPorCausaDescargadas(causaId: number) {
    return this.ORDEN + `/descargadas/causa/${causaId}`
  },
  listarPorCausaPronuncioAbogado(causaId: number) {
    return this.ORDEN + `/pronuncio-abogado/causa/${causaId}`
  },
  listarPorCausaCuentaConciliadas(causaId: number) {
    return this.ORDEN + `/cuenta-conciliada/causa/${causaId}`
  },
  listarPorCausaVencidasLeves(causaId: number) {
    return this.ORDEN + `/vencidas-leves/causa/${causaId}`
  },
  listarPorCausaVencidasGraves(causaId: number) {
    return this.ORDEN + `/vencidas-graves/causa/${causaId}`
  },
  obtenerCantidadEtapasOrdenDeLider() {
    return this.ORDEN + `/cantidad-orden-etapas/lider`
  },
  //Listado de lider
  listarPorCausaGiradasDeLider(causaId: number) {
    return this.ORDEN + `/giradas-lider/causa/${causaId}`
  },
  listarPorCausaPrePresupuestadasDeLider(causaId: number) {
    return this.ORDEN + `/pre-presupuestadas-lider/causa/${causaId}`
  },
  listarPorCausaPresupuestadasDeLider(causaId: number) {
    return this.ORDEN + `/presupuestadas-lider/causa/${causaId}`
  },
  listarPorCausaAceptadasDeLider(causaId: number) {
    return this.ORDEN + `/aceptadas-lider/causa/${causaId}`
  },
  listarPorCausaDineroEntregadoDeLider(causaId: number) {
    return this.ORDEN + `/dinero-entregado-lider/causa/${causaId}`
  },
  listarPorCausaListaRealizarDeLider(causaId: number) {
    return this.ORDEN + `/lista-realizar-lider/causa/${causaId}`
  },
  listarPorCausaDescargadasDeLider(causaId: number) {
    return this.ORDEN + `/descargadas-lider/causa/${causaId}`
  },
  listarPorCausaPronuncioAbogadoDeLider(causaId: number) {
    return this.ORDEN + `/pronuncio-abogado-lider/causa/${causaId}`
  },
  listarPorCausaCuentaConciliadasDeLider(causaId: number) {
    return this.ORDEN + `/cuenta-conciliada-lider/causa/${causaId}`
  },
  listarPorCausaVencidasLevesDeLider(causaId: number) {
    return this.ORDEN + `/vencidas-leves-lider/causa/${causaId}`
  },
  listarPorCausaVencidasGravesDeLider(causaId: number) {
    return this.ORDEN + `/vencidas-graves-lider/causa/${causaId}`
  },
  listarParaPagoAProcurador(procuradorId: number) {
    return this.ORDEN + `/listado-para-pago-procurador/${procuradorId}`
  },
  obtenerSumatoriaGastosHastaFecha(causaId: number, fechaCierre: string) {
    return this.ORDEN + `/sumatoria-gastos-fecha/${causaId}/${fechaCierre}`
  },
  listadoDetFinancieroCausa(causaId: number) {
    return this.ORDEN + `/detalle-financiero/causa/${causaId}`
  }
})

const getOrdenes = async (
  options: IOpcionesPaginado,
  idCausa?: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(idCausa ? ENDPOINT.listarPorCausa(idCausa) : ENDPOINT.ORDEN, {
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
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Error al obtener las órdenes'
    const statusCode = error?.response?.status || 500

    throw new Error(`${statusCode}|${errorMessage}`) // Propaga el error para el componente
    console.error('Failed to fetch orden', error)
    //return CrearRespuestaPaginado()
  }
}

const getOrdenesPorProcurador = async (
  options: IOpcionesPaginado,
  idCausa: number,
  procuradorId: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaDeProcurador(idCausa, procuradorId) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )

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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const listarParaEntregarPresupuesto = async (id: number) => {
  const response = await axios
    .get<{ data: IOrden[] }>(`${ENDPOINT.listadoParaEntregarPresupuesto(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarParaDevolverPresupuesto = async (id: number) => {
  const response = await axios
    .get<{ data: IOrden[] }>(`${ENDPOINT.listadoParaDevolverPresupuesto(id)}`)
    .catch(() => undefined)

  return response?.data.data
}
const listarSinCostoJudicialVenta = async () => {
  const response = await axios
    .get<{ data: IOrden[] }>(`${ENDPOINT.listarSinCostoJudicialVenta()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerCantidadEtapasOrden = async () => {
  const response = await axios
    .get<{ data: ICantidadEtapasOrden }>(`${ENDPOINT.obtenerCantidadEtapasOrden()}`)
    .catch(() => undefined)

  return response?.data.data
}
const obtenerCantidadEtapasOrdenDeLider = async () => {
  const response = await axios
    .get<{ data: ICantidadEtapasOrden }>(`${ENDPOINT.obtenerCantidadEtapasOrdenDeLider()}`)
    .catch(() => undefined)

  return response?.data.data
}

const getOrdenesGiradas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaGiradas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesPrePresupuestadas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPrePresupuestadas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesPresupuestadas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPresupuestadas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesAceptadas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaAceptadas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesDineroEntregado = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaDineroEntregado(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesListaRealizar = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaListaRealizar(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesDescargadas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaDescargadas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesPronuncioAbogado = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPronuncioAbogado(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesCuentasConciliadas = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaCuentaConciliadas(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesVencidasLeves = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaVencidasLeves(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesVencidasGraves = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaVencidasGraves(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
//Listado para lider
const getOrdenesGiradasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaGiradasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesPrePresupuestadasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPrePresupuestadasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesPresupuestadasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPresupuestadasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const getOrdenesAceptadasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaAceptadasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesDineroEntregadoDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaDineroEntregadoDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesListaRealizarDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaListaRealizarDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesDescargadasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaDescargadasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesPronuncioAbogadoDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaPronuncioAbogadoDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesCuentasConciliadasDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaCuentaConciliadasDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesVencidasLevesDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaVencidasLevesDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}
const getOrdenesVencidasGravesDeLider = async (
  options: IOpcionesPaginado,
  idCausa: number
): Promise<{ pagination: IPaginado; result: IOrden[] }> => {
  try {
    const response = await axios.get(
      idCausa ? ENDPOINT.listarPorCausaVencidasGravesDeLider(idCausa) : ENDPOINT.ORDEN,
      {
        params: {
          page: options.page,
          perPage: options.perPage,
          search: JSON.stringify(options.search),
          sort: JSON.stringify(options.sort)
        }
      }
    )
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
    console.error('Failed to fetch orden', error)
    return CrearRespuestaPaginado()
  }
}

const listarParaPagoAProcurador = async (
  id: number,
  fechaInicioConsulta: string,
  fechaFinConsulta: string
) => {
  const response = await axios
    .get<{
      data: IOrden[]
    }>(`${ENDPOINT.listarParaPagoAProcurador(id)}`, {
      params: {
        fecha_inicio_consulta: fechaInicioConsulta,
        fecha_fin_consulta: fechaFinConsulta
      }
    })
    .catch(() => undefined)

  return response?.data.data
}

const obtenerSumatoriaGastosHastaFecha = async (
  causaId: number,
  fechaCierre: string
): Promise<number> => {
  try {
    const response = await axios.get<{ data: number }>(
      `${ENDPOINT.obtenerSumatoriaGastosHastaFecha(causaId, fechaCierre)}`
    )
    return response.data.data
  } catch {
    return 0 // 👈 valor por defecto
  }
}
const listadoDetFinancieroCausa = async (
  causaId: number
): Promise<ServiceResponse<IDetalleFinanciero[]>> => {
  try {
    const response = await axios.get<IDetalleFinanciero[]>(
      `${ENDPOINT.listadoDetFinancieroCausa(causaId)}`
    )
    return {
      status: 'success',
      data: response.data
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

export default {
  getOrdenes,
  getOrdenesPorProcurador,
  listarParaEntregarPresupuesto,
  listarParaDevolverPresupuesto,
  listarSinCostoJudicialVenta,
  obtenerCantidadEtapasOrden,
  getOrdenesGiradas,
  getOrdenesPrePresupuestadas,
  getOrdenesPresupuestadas,
  getOrdenesAceptadas,
  getOrdenesDineroEntregado,
  getOrdenesListaRealizar,
  getOrdenesDescargadas,
  getOrdenesPronuncioAbogado,
  getOrdenesCuentasConciliadas,
  getOrdenesVencidasLeves,
  getOrdenesVencidasGraves,
  obtenerCantidadEtapasOrdenDeLider,
  getOrdenesGiradasDeLider,
  getOrdenesPrePresupuestadasDeLider,
  getOrdenesPresupuestadasDeLider,
  getOrdenesAceptadasDeLider,
  getOrdenesDineroEntregadoDeLider,
  getOrdenesListaRealizarDeLider,
  getOrdenesDescargadasDeLider,
  getOrdenesPronuncioAbogadoDeLider,
  getOrdenesCuentasConciliadasDeLider,
  getOrdenesVencidasLevesDeLider,
  getOrdenesVencidasGravesDeLider,
  listarParaPagoAProcurador,
  obtenerSumatoriaGastosHastaFecha,
  listadoDetFinancieroCausa
}
