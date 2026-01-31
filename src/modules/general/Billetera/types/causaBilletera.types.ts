import type { IMateria } from "@/modules/admin/Materia/materia.types"
import type { IParticipante } from "../../Participantes/types/participante.types"
import type { ITribunal } from "../../Tribunal/types/tribunal.types"
import type { ITipoLegal } from "@/modules/admin/TipoLegal/tipo-lega.types"
export interface ICausaBilletera {
    id: number
    nombre: string
    observacion: string
    objetivos: string
    estrategia: string
    informacion: string
    apuntes_juridicos: string
    apuntes_honorarios: string
    tiene_billetera: number
    billetera: number
    saldo_devuelto: number
    color: string
    materia_id: number
    tipolegal_id: number | undefined
    categoria_id: number
    abogado_id: number
    procurador_id: number
    usuario_id: number
    plantilla_id: number
    estado: string
    es_eliminado: number
    created_at: string
    updated_at: string
    materia?: IMateria | null
    tipo_legal?: ITipoLegal | null
    primer_demandante?: IParticipante | null
    primer_demandado?: IParticipante | null
    primer_tribunal?: ITribunal | null
  }