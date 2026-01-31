interface IPersona {
  nombre: string
  apellido: string
  telefono: string
  direccion: string
  coordenadas: string
  observacion: string
  foto_url: string
}

export interface IPerfilUsuario {
  name: string
  email: string
  tipo: string
  persona: IPersona
}
