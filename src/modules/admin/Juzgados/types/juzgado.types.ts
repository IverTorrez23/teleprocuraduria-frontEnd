import type { IDistrito } from '../../Distritos/types/distrito.types'
import type { IPiso } from '../../Piso/types/piso.types'

export interface IJuzgado {
  id: number
  nombre_numerico: number
  jerarquia: string
  materia_juzgado: string
  coordenadas: string
  foto_url: string
  contacto1: string
  contacto2: string
  contacto3: string
  contacto4: string
  distrito_id: number
  piso_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  piso?: IPiso | null
  distrito?: IDistrito | null
}
