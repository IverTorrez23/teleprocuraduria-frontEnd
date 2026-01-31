export interface ITransaccionesContador {
  id: number
  monto: number
  fecha_transaccion: string
  tipo: string
  transaccion: string
  glosa: string
  contador_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
