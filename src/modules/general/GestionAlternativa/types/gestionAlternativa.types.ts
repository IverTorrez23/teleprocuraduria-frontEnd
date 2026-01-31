export interface IGestionAlternativa {
  id: number
  solicitud_gestion: string
  fecha_solicitud: string
  tribunal_id: number
  cuerpo_expediente_id: number
  detalle_gestion: string
  fecha_respuesta: string
  orden_id: number
  estado: string
  es_eliminado: number
  tribunal?: Tribunal | null
  cuerpo_expediente?: CuerpoExpediente | null
}

interface Tribunal {
  id: number
  expediente: string
  clasetribunal_id: number
  clase_tribunal?: ClaseTribunal | null
}
interface ClaseTribunal {
  id: number
  nombre: string
}
interface CuerpoExpediente {
  id: number
  nombre: string
  link_cuerpo: string
}
