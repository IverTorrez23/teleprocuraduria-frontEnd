export interface IInformePosta {
  id: number
  foja_informe: string
  fecha_informe: string
  calculo_gasto: number
  honorario_informe: string
  foja_truncamiento: string
  fecha_truncamiento: string
  honorario_informe_truncamiento: string
  esta_escrito: number
  tipoposta_id?: number | undefined
  causaposta_id: number
  estado: string
  es_eliminado: number
  created_at: string
  updated_at: string
}
