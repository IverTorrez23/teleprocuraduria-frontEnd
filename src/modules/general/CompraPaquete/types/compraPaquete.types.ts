import type { IPaquete } from '@/modules/admin/Paquetes/types/paquete.types'
import type { IPaqueteCausa } from '../../PaqueteCausa/types/paqueteCausa.types'

export interface ICompraPaquete {
  id: number
  monto: number
  fecha_ini_vigencia: string
  fecha_fin_vigencia: string
  fecha_compra: string
  dias_vigente: number
  paquete_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  paquete?: IPaquete | null
  paquete_causas?: IPaqueteCausa | null
}
