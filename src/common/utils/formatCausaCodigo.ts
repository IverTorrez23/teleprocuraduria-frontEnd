import type { IOrden } from '@/modules/general/Ordenes/types/orden.types'

export const formatCausaCodigo = (orden: IOrden): string => {
  if (!orden || !orden.causa) return 'N/A'
  return `${orden.causa.materia?.abreviatura || ''}-${orden.causa.tipo_legal?.abreviatura || ''}-${orden.causa.id}`
}
