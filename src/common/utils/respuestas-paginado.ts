import type { IPaginado } from '../common.types'

export const CrearRespuestaPaginado = () => ({
  pagination: {
    totalItems: 0,
    itemCount: 0,
    perPage: 0,
    currentPage: 0
  } as IPaginado,
  result: []
})
