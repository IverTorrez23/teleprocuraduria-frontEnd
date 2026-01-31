export interface ICredenciales {
  email: string
  password: string
}

export interface IPersona {
  nombre: string
  apellido: string
  telefono: string
  foto_url: string
}

export interface IUsuario {
  id: number
  name: string
  email: string
  tipo: string
  estado?: string
  persona?: IPersona
  accessToken: string
  tokenType: string
  expiresAt: Date
}

export interface IRegistroForm {
  nombre: string
  apellido: string
  email: string
  password: string
  direccion?: string
  telefono?: string
  coordenadas?: string
  observacion?: string
  tipo: string
  foto_url?: string
  opciones_moto: {
    NO_MOTO: boolean
    SI_MANEJA_NO_TIENE: boolean
    SI_MOTO: boolean
  }
}

export interface Persona {
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
  usuario_id: number
  created_at: string
  updated_at: string
}

export interface UsuarioData {
  id: number
  name: string
  email: string
  tipo: string
  abogado_id: number
  opciones_moto: any | null
  estado: string
  es_eliminado: number
  updated_at: string
  created_at: string
  persona: Persona
}

export interface RegistroResponse {
  status: string
  message: string
  data?: UsuarioData
  access_token?: string
  token_type?: string
}
