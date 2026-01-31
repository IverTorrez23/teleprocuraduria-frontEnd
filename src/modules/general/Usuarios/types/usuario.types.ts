export interface IUsuario {
  id: number
  name: string
  email: string
  password: string
  email_verified_at: string | null
  tipo: string
  abogado_id: number
  opciones_moto: string[]
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
  persona?: IPersona | null
}

export interface IPersona {
  id: number
  nombre: string
  apellido: string
  telefono: string
  direccion: string
  coordenadas: string
  observacion: string
  foto_url: string
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
