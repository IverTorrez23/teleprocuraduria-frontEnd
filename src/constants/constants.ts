import { ref } from 'vue'
export const TipoDocumentoArray = ref([
  { name: 'TRAMITES', code: 'TRAMITES' },
  { name: 'NORMAS', code: 'NORMAS' }
])

export const TipoDocumento = {
  TRAMITES: 'TRAMITES',
  NORMAS: 'NORMAS'
} as const
export const TableSize = {
  small: 'small',
  normal: 'null',
  large: 'large'
} as const
export const TipoParticipante = [
  { label: 'DEMANDANTE', value: 'DEMANDANTE' },
  { label: 'DEMANDADO', value: 'DEMANDADO' },
  { label: 'TERCERISTA', value: 'TERCERISTA' }
]

export const EstadosCausa = [
  { label: 'ACTIVA', value: 'ACTIVA' },
  { label: 'CONGELADA', value: 'CONGELADA' },
  { label: 'TERMINADA', value: 'TERMINADA' },
  { label: 'BLOQUEADA', value: 'BLOQUEADA' }
]
export const EstadosCausas = {
  ACTIVA: 'ACTIVA',
  CONGELADA: 'CONGELADA',
  TERMINADA: 'TERMINADA',
  BLOQUEADA: 'BLOQUEADA'
} as const
export const TipoUsuario = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  ABOGADO_INDEPENDIENTE: 'ABOGADO_INDEPENDIENTE',
  ABOGADO_LIDER: 'ABOGADO_LIDER',
  ABOGADO_DEPENDIENTE: 'ABOGADO_DEPENDIENTE',
  PROCURADOR: 'PROCURADOR',
  CONTADOR: 'CONTADOR',
  PROCURADOR_MAESTRO: 'PROCURADOR_MAESTRO',
  OBSERVADOR: 'OBSERVADOR'
} as const
export const EtapaOrden = {
  GIRADA: 'GIRADA',
  PREPRESUPUESTADA: 'PREPRESUPUESTADA',
  PRESUPUESTADA: 'PRESUPUESTADA',
  ACEPTADA: 'ACEPTADA',
  
  DINERO_ENTREGADO: 'DINERO_ENTREGADO',
  DESCARGADA: 'DESCARGADA',
  PRONUNCIO_ABOGADO: 'PRONUNCIO_ABOGADO',
  PRONUNCIO_CONTADOR: 'PRONUNCIO_CONTADOR',
  CERRADA: 'CERRADA'
} as const
export const TinymceConfig = {
  height: 300,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'help',
    'wordcount'
  ],
  toolbar:
    'undo redo | blocks | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
}

export const TipoPaquete = [
  { label: 'LIDER', value: 'ABOGADO_LIDER' },
  { label: 'INDEPENDIENTE', value: 'ABOGADO_INDEPENDIENTE' }
]

export const TinymceApiKey = 'md43nzm1il39i9jiztv2l0add2tl5i0ndyidaeukzkh4d1dm' //Api key ivermenacho@gmial.com

export const getTipoSeverityTrn = (tipo: string): string => {
  switch (tipo) {
    case 'CREDITO':
      return 'success'
    case 'DEBITO':
      return 'danger'
    default:
      return 'info' // valor por defecto
  }
}
export const CalificacionesOrden = {
  SUFICIENTE: 'SUFICIENTE',
  INSUFICIENTE: 'INSUFICIENTE'
} as const