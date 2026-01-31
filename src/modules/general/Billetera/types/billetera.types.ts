export interface IBilletera {
    id: number
    monto: number
    abogado_id: number
    estado: string
    es_eliminado: number
}

export interface IBilleteraUsuario {
    id: number
    monto:number
    abogado_id: number
    abogado?:IAbogado
}

interface IAbogado {
    id:number
    name:string
    persona?: IPersona
}
interface IPersona {
    id:number
    nombre:string
    apellido:string
    usuario_id:number
}