export interface IProcuradorPago {
  id: number
  monto: number
  tipo: string
  fecha_pago: string
  fecha_inicio_consulta: string
  fecha_fin_consulta: string
  glosa: string
  procurador_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
