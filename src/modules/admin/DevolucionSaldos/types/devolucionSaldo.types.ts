export interface IDevolucionSaldo {
  id: number
  fecha_devolucion: string
  glosa: string
  monto: number
  billetera_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
