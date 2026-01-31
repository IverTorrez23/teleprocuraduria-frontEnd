export interface ICodigosCausa {
  id: number
  nombre: string
  abreviatura: string
  materia_id: number
  materia: Imateria
}

interface Imateria {
  id: number
  abreviatura: string
}
