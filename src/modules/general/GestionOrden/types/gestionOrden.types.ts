export interface IGestionOrden {
  id: number
  entrega_informacion: string
  fecha_inicio: string
  fecha_fin: string
  prioridad:number
  causa_id: number
  contador?: string; //aquí guardaremos el contador
  causa?: ICausa | null
  detalle_presupuesto?:string
  expediente?:string
  ultima_foja?:string
}
interface ICausa {
  id: number
  nombre: string
  observacion: string
  estado: string
  materia_id: number
  tipolegal_id: number
  categoria_id: number
  abogado_id: number
  procurador_id: number
  materia?: IMateria | null
  tipo_legal?: ITipoLegal | null
  categoria?: ICategoria | null
  abogado?: IAbogado | null
  procurador?: IProcurador | null
  tribunales?: ITribunales | null
}
interface IMateria {
  id: number
  nombre: string
  abreviatura: string
}
interface ITipoLegal {
  id: number
  nombre: string
  abreviatura: string
}
interface ICategoria {
  id: number
  nombre: string
  abreviatura: string
}
interface IAbogado {
  id: number
  persona?: IPersona | null
}
interface IProcurador {
  id: number
  persona?: IPersona | null
}
interface IPersona {
  id: number
  nombre: string
  apellido: string
  usuario_id: number
}
interface ITribunales {
  id: number
  expediente: string
  tribunal_dominante: number
  causa_id: number
  juzgado_id: number
  juzgado?: IJuzgado | null
}
interface IJuzgado {
  id: number
  nombre_numerico: number
  piso_id: number
  piso?: IPiso | null
}
interface IPiso {
  id: number
  nombre: string
}
