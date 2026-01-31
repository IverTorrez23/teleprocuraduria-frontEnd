export interface IPaquete {
  id: number
  nombre: string
  precio: number
  cantidad_dias: number
  descripcion: string
  fecha_creacion: string
  usuario_id: number
  tiene_fecha_limite:number
  fecha_limite_compra:string
  tipo: string
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
