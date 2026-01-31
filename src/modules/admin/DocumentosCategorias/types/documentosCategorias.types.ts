export interface IDocumentoCategoria {
  id: number
  nombre: string
  tipo: string
  categoria_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  padre?: IDocumentoCategoria | null
}
