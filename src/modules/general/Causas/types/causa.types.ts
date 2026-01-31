import type { IMateria } from '@/modules/admin/Materia/materia.types'
import type { ICategorias } from '@/modules/admin/Categorias/categorias.types'
import type { ITipoLegal } from '@/modules/admin/TipoLegal/tipo-lega.types'
import type { IUsuario } from '../../Usuarios/types/usuario.types'
export interface ICausa {
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
  motivo_congelada: string
  es_eliminado: number
  created_at: string
  updated_at: string
  materia?: IMateria | null
  categoria?: ICategorias | null
  tipo_legal?: ITipoLegal | null
  abogado?: IUsuario | null
  procurador?: IUsuario | null
  ordenes?: IOrdenesUrgencias | null
}

interface IOrdenesUrgencias {
  id: number
  fecha_inicio: string
  fecha_fin: string
  prioridad: number
  causa_id: number
}
export interface ITribunalDominanteResponse {
  procurador_id: number | null
  tribunal_dominante: string | null
}
