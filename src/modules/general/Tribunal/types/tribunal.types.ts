import type { IClaseTribunal } from '@/modules/admin/ClaseTribunal/types/clase-tribunal.types'
import type { IJuzgado } from '@/modules/admin/Juzgados/types/juzgado.types'
import type { ICuerpoExpediente } from '../../CuerpoExpedientes/types/cuerpo-expediente.types'

export interface ITribunal {
  id: number
  expediente: string
  codnurejianuj: string
  link_carpeta: string
  clasetribunal_id: number
  causa_id: number
  juzgado_id: number
  tribunal_dominante: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  clase_tribunal?: IClaseTribunal | null
  juzgado?: IJuzgado | null
  cuerpo_expedientes?: ICuerpoExpediente[] | null
}
