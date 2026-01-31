import type { IInformePosta } from '../../InformePosta/types/informePosta.types'

export interface ICausaPosta {
  id: number
  nombre: string
  numero_posta: string
  copia_nombre_plantilla: string
  tiene_informe: number
  causa_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  informe_posta?: IInformePosta | null
}
