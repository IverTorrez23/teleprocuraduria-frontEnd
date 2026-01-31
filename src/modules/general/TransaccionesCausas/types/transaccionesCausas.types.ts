export interface ITransaccionesCausa {
    id: number
    monto: number
    fecha_transaccion: string
    tipo: string
    transaccion: string
    glosa: string
    causa_id: number
    causa_origen_destino: number
    usuario_id: number
    estado?: string
    es_eliminado?: number
    created_at?: string
    updated_at?: string
    desde_billetera: number | null
  }
  