import type { IDocumentoCategoria } from '../../DocumentosCategorias/types/documentosCategorias.types'
export interface IDocumento {
  id: number
  nombre: string
  archivo_url: string
  tipo: string
  categoria_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  categoria?: IDocumentoCategoria | null
}
