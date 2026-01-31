export interface ICrearOrden {
  id?: number | null
  entrega_informacion: string
  entrega_documentacion: string
  fecha_inicio: string
  fecha_fin: string
  prioridad: number
  lugar_ejecucion: string
  tiene_propina: number
  propina: number
  causa_id: number
  procurador_id: number
}
