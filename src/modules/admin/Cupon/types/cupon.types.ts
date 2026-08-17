export interface ICupon {
  id: number
  codigo: string
  fecha_uso: string
  paquete_id: number
  usuario_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  cantidad: number
}

export interface IGenerarCuponesLote {
  paquete_id: number
  cantidad: number
}

export interface ICuponGeneradoExcel {
  id: number
  codigo: string
  fecha_limite_activacion: string | null
  vigencia_dias: number
  precio: number
  nombre_paquete: string
}

export interface IPaqueteCupon {
  id: number
  nombre: string
  fecha_limite_compra: string | null
  cantidad_dias: number
  precio: number
}

export interface IRespuestaCuponesLote {
  status: 'success'
  message: string
  data: {
    paquete: IPaqueteCupon
    cantidad_generada: number
    cupones: ICuponGeneradoExcel[]
  }
}
