export interface IBilleteraTransaccion {
  id: number
  monto: number
  fecha_transaccion: string
  tipo: string
  glosa: string
  billetera_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
}
