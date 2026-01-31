import type { ICausa } from "../../Causas/types/causa.types"

export interface IPaqueteCausa {
  id: number
  fecha_inicio: string
  fecha_fin: string
  compra_paquete_id: number
  causa_id: number
  fecha_asociacion: string
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  causa?: ICausa | null
}
