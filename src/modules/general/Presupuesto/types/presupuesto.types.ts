export interface IPresupuesto {
  id: number
  monto: number
  detalle_presupuesto: string
  fecha_presupuesto: string
  fecha_entrega: string
  contador_id: number
  orden_id: number
  estado: string
  es_eliminado: number
  prioridad?: number //Para el registro de presupuesto
  procurador_id?:number //Para el registro de presupuesto
  created_at: string
  updated_at: string
}
