export interface INotificacion {
  id: number
  tipo: number
  evento: string
  emisor: string
  nombre_emisor: string
  tipo_receptor: number
  receptor_estatico: string
  descripcion_receptor_estatico: string
  asunto: string
  envia_notificacion: number
  texto: string
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
