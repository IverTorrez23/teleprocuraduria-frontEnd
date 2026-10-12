export interface ISugerenciaGasto {
  id: number
  detalle: string
  monto: number
  orden_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}