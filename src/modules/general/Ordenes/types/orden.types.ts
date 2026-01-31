export interface IOrden {
  id: number
  entrega_informacion: string
  entrega_documentacion: string
  fecha_inicio: string
  fecha_fin: string
  fecha_giro: string
  plazo_hora: string
  fecha_recepcion: string | null
  etapa_orden: string
  calificacion: string
  prioridad: number
  fecha_cierre: string | null
  girada_por: string
  fecha_ini_bandera: string
  notificado: number
  lugar_ejecucion: string
  sugerencia_presupuesto: string
  tiene_propina: number
  propina: number
  causa_id: number
  procurador_id: number
  matriz_id: number
  usuario_id: number
  estado: string
  causa: Causa
  procurador: Procurador
  matriz: Matriz
  cotizacion: Cotizacion
  descarga?: Descarga | null
  final_costos?: FinalCosto | null
  presupuesto?: Presupuesto | null
}

interface Procurador {
  id: number
  name: string
  email: string
  tipo: string
  estado: string
  persona: Persona | null
}
interface Persona {
  usuario_id: number
  nombre: string
  apellido: string
  telefono: string
  direccion: string
}

interface Causa {
  id: number
  nombre: string
  materia_id: number
  tipolegal_id: number
  materia: Materia
  tipo_legal: TipoLegal
  usuario_id?: number
  abogado_id?: number
}

interface Matriz {
  id: number
  numero_prioridad: number
  precio_compra: string
  penalizacion: string
}

interface Materia {
  id: number
  abreviatura: string
}

interface TipoLegal {
  id: number
  abreviatura: string
}

interface Cotizacion {
  id: number
  compra?: number
  venta?: number
  penalizacion?: number
  prioridad?: number
  condicion?: number
  orden_id: number
}
interface Descarga {
  id: number
  compra_judicial?: number
  ultima_foja?: string
  fecha_descarga?: string
  detalle_informacion?: string
  detalle_documentacion?: string
  gastos?: number
  saldo?: number
  detalle_gasto?: string
  orden_id: number
  confirmacion?: Confirmacion | null
}
interface Confirmacion {
  id: number
  confir_sistema?: number
  confir_abogado?: number
  fecha_confir_abogado?: string
  confir_contador?: number
  fecha_confir_contador?: string
  justificacion_rechazo?: string
  descarga_id?: number
  estado?: string
}
interface FinalCosto {
  id: number
  costo_procuraduria_compra: number
  costo_procuraduria_venta: number
  costo_procesal_compra: number
  costo_procesal_venta: number

  total_egreso: number
  orden_id: number
}
interface Presupuesto {
  id: number
  monto?: number
  detalle_presupuesto?: string
  fecha_presupuesto?: string
  fecha_entrega?: string
  orden_id: number
}
export interface IOrdenCodigo extends IOrden {
  codigoCausa: string
}

export interface IDetalleFinanciero {
  id: number
  entrega_informacion: string
  detalle_informacion: string
  fecha_fin: string
  prioridad: number
  condicion: number
  compra_judicial: number //Lo que se gasto en la descarga
  costo_procesal_venta: number //lo define el admin
  venta: number //cotizacion de procuraduria
  costo_procuraduria_venta: number //costo final
  total_egreso: number
  etapa_orden: string
  es_validado: number
}
