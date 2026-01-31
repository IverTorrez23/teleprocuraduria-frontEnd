export interface IConfirmacion {
  id: number
  confir_sistema: number
  confir_abogado: number | null
  fecha_confir_abogado: string
  confir_contador: number
  fecha_confir_contador: string
  justificacion_rechazo: string
  descarga_id: number
  estado: string
  monto_propina?: number | null //Campo colocado solo par el uso de la confirmacion del abogado
}
