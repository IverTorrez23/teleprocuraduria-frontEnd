export interface ITransaccionesAdmin {
  id: number
  monto: number
  fecha_transaccion: string
  tipo: string
  transaccion: string
  glosa: string
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
