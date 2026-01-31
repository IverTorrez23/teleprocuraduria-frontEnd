<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import CausaService from '../services/causa.service'
import type { ICausa } from '../types/causa.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { ITribunal } from '../../Tribunal/types/tribunal.types'
import tribunalService from '../../Tribunal/services/tribunal.service'
import { baseUrlResource } from '@/config/constants'
import OVisorImg from '@/components/OVisorImg.vue'
import OVisorPDFModal from '@/components/OVisorPDFModal.vue'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import type { IClaseTribunal } from '@/modules/admin/ClaseTribunal/types/clase-tribunal.types'
import claseTribunalService from '@/modules/admin/ClaseTribunal/services/clase-tribunal.service'
import type { IJuzgado } from '@/modules/admin/Juzgados/types/juzgado.types'
import juzgadoService from '@/modules/admin/Juzgados/services/juzgado.service'
import type { ICuerpoExpediente } from '../../CuerpoExpedientes/types/cuerpo-expediente.types'
import type { IParticipante } from '../../Participantes/types/participante.types'
import participanteService from '../../Participantes/services/participante.service'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'
import {
  TinymceApiKey,
  TinymceConfig,
  TipoParticipante,
  TableSize,
  EstadosCausas,
  EtapaOrden,
  getTipoSeverityTrn
} from '@/constants/constants'
import type { IMenuItem } from '@/common/utils/types/menuItem.types'
import { isAbogadoAutorizado } from '@/common/utils/usuarioAutorizado'
import transaccionesCausasService from '../../TransaccionesCausas/services/transaccionesCausas.service'
import type { ITransaccionesCausa } from '../../TransaccionesCausas/types/transaccionesCausas.types'
import ordenService from '../../Ordenes/services/orden.service'
import type { IDetalleFinanciero } from '../../Ordenes/types/orden.types'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'

const route = useRoute()
const router = useRouter()
const idCausa = Number(route.params.id) //Desde la Url
const toast = useToast()
const dt2 = ref()

const cambioEstadoDialog = ref(false)
const causaDialog = ref(false)
const otrosCamposCausaDialog = ref(false)
const headerOtrosCamposCausaDialog = ref('')
const causa = ref<ICausa>({
  id: 0,
  nombre: '',
  observacion: '',
  objetivos: '',
  estrategia: '',
  informacion: '',
  apuntes_juridicos: '',
  apuntes_honorarios: '',
  tiene_billetera: 0,
  billetera: 0,
  saldo_devuelto: 0,
  color: '',
  materia_id: 0,
  tipolegal_id: 0,
  categoria_id: 0,
  abogado_id: 0,
  procurador_id: 0,
  usuario_id: 0,
  plantilla_id: 0,
  estado: '',
  motivo_congelada: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
///Tribunal
const showImageDialog = ref(false)
const selectedImageUrl = ref('')
const selectedPDFUrl = ref('')
const showPDFModal = ref(false)
const dtTribunal = ref()
const tribunalDialog = ref(false)
const tribunales = ref<ITribunal[]>([])
const deleteTribunalDialog = ref(false)
const transaccionesDeCausa = ref<ITransaccionesCausa[]>([])
const trnEnvioRecibidoCausa = ref<ITransaccionesCausa[]>([])
const detalleFinanciero = ref<IDetalleFinanciero[]>([])
const tribunal = ref<ITribunal>({
  id: 0,
  expediente: '',
  codnurejianuj: '',
  link_carpeta: '',
  clasetribunal_id: 0,
  causa_id: 0,
  juzgado_id: 0,
  tribunal_dominante: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

//Participantes
const selectedParticipantes = ref<IParticipante[]>([])
const dtParticipante = ref()
const participanteDialog = ref(false)
const participantes = ref<IParticipante[]>([])
const deleteParticipanteDialog = ref(false)
const participante = ref<IParticipante>({
  id: 0,
  nombres: '',
  tipo: '',
  foja: '',
  ultimo_domicilio: '',
  causa_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const claseTribunales = ref<IClaseTribunal[]>([])
const juzgados = ref<IJuzgado[]>([])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const filtersDep = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const submitted = ref(false)
const pagination = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})
const paginationDep = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})

const loadParticipantePorCausa = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombres', 'tipo'], keyword: filters.value.global.value }]
    : []
  const sort: ISort[] =
    event && event.sortField
      ? [
          {
            field: typeof event.sortField === 'string' ? event.sortField : '',
            orderType: event.sortOrder === 1 ? 'ASC' : 'DESC'
          }
        ]
      : []
  const opciones: IOpcionesPaginado = {
    page: page,
    perPage: perPage,
    search: search,
    sort: sort
  }
  const response = await participanteService.getParticipantesDeCausa(opciones, idCausa)

  participantes.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadDepositosDeUnaCausa = async (event?: DataTableSortEvent) => {
  try {
    const page = event ? event.first / event.rows + 1 : paginationDep.value.currentPage
    const perPage = event ? event.rows : paginationDep.value.rowsPerPage
    const search: ISearch[] = filtersDep.value.global.value
      ? [
          {
            fields: ['fecha_transaccion', 'monto', 'tipo', 'glosa', 'transaccion'],
            keyword: filtersDep.value.global.value
          }
        ]
      : []
    const sort: ISort[] =
      event && event.sortField
        ? [
            {
              field: typeof event.sortField === 'string' ? event.sortField : '',
              orderType: event.sortOrder === 1 ? 'ASC' : 'DESC'
            }
          ]
        : []
    const opciones: IOpcionesPaginado = {
      page: page,
      perPage: perPage,
      search: search,
      sort: sort
    }

    const response = await transaccionesCausasService.getDepositosDeUnaCausa(opciones, idCausa)

    transaccionesDeCausa.value = response.result
    paginationDep.value.rowsNumber = response.pagination.rowsNumber
    paginationDep.value.totalItems = response.pagination.totalItems
    paginationDep.value.itemCount = response.pagination.itemCount
    paginationDep.value.rowsPerPage = response.pagination.rowsPerPage
    paginationDep.value.currentPage = response.pagination.currentPage
  } catch (error) {
    console.error('Error al cargar las depositos:', error)
  } finally {
    console.error('Finalizo con exito:')
  }
}

const loadDetalleFinancieroCausa = async () => {
  const result = await ordenService.listadoDetFinancieroCausa(idCausa)

  if (result.data) {
    detalleFinanciero.value = result.data
    console.log('result.data', detalleFinanciero.value)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las ordenes.',
      life: 3000
    })
  }
}
const loadTrnEnvioRecibidoCausa = async () => {
  const result = await transaccionesCausasService.listaTrnEnvioRecibidoCausa(idCausa)

  if (result.data) {
    trnEnvioRecibidoCausa.value = result.data
    console.log('result.data', trnEnvioRecibidoCausa.value)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las trn Causa.',
      life: 3000
    })
  }
}

const causaSelected = ref<ICausa>()

const loadUnaCausa = async (idCausa: number) => {
  try {
    const response = await CausaService.obtenerUnaCausa(idCausa)
    causaSelected.value = response
    actualizarItems()
    return true
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Fallo al obtener una Causa',
      life: 8000
    })
    return false
  }
}

const loadClaseTribunales = async () => {
  const response = await claseTribunalService.listarClaseTribunales()
  if (response) {
    claseTribunales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Clase Tribunal',
      life: 3000
    })
  }
}
const loadJuzgados = async () => {
  const response = await juzgadoService.listarJuzgados()
  if (response) {
    juzgados.value = response.map((juzgado) => ({
      ...juzgado,
      nombreJuzgado: `${juzgado.nombre_numerico + '°' || ''} ${juzgado.jerarquia || ''} ${juzgado.materia_juzgado || ''} ${juzgado?.distrito?.abreviatura || ''}`
    }))
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Juzgados',
      life: 3000
    })
  }
}

onMounted(async () => {
  const success = await loadUnaCausa(idCausa)

  if (!success) {
    // Si no se pudo cargar la causa, salimos sin ejecutar el resto
    return
  }

  // Si la causa se cargó correctamente, continuar con las demás funciones
  loadTribunalesPorCausa(idCausa)
  loadParticipantePorCausa()
  loadClaseTribunales()
  loadJuzgados()
  loadDepositosDeUnaCausa()
  loadDetalleFinancieroCausa()
  loadTrnEnvioRecibidoCausa()
})
watch([() => filters.value.global.value, () => filtersDep.value.global.value], () => {
  loadParticipantePorCausa()
  loadDepositosDeUnaCausa()
})

const openNewTribunal = () => {
  tribunal.value = {} as ITribunal
  tribunal.value.tribunal_dominante = 0
  submitted.value = false
  tribunalDialog.value = true
}
const campoObservacionEditarVisible = ref(false)
const campoObjetivoEditarVisible = ref(false)
const campoEstrategiaEditarVisible = ref(false)
const campoApunJuridicoEditarVisible = ref(false)
const campoHonorarioEditarVisible = ref(false)
const campoInformacionEditarVisible = ref(false)
const resetCamposVisibles = () => {
  campoObservacionEditarVisible.value = false
  campoObjetivoEditarVisible.value = false
  campoEstrategiaEditarVisible.value = false
  campoApunJuridicoEditarVisible.value = false
  campoHonorarioEditarVisible.value = false
  campoInformacionEditarVisible.value = false
}
const openNewOtrosCamposCausa = (cau: ICausa, campo: string) => {
  resetCamposVisibles()
  switch (campo) {
    case 'Observación':
      campoObservacionEditarVisible.value = true
      break
    case 'Objetivos':
      campoObjetivoEditarVisible.value = true
      break
    case 'Estrategia':
      campoEstrategiaEditarVisible.value = true
      break
    case 'Apuntes Juridicos':
      campoApunJuridicoEditarVisible.value = true
      break
    case 'Honorarios':
      campoHonorarioEditarVisible.value = true
      break
    case 'Información':
      campoInformacionEditarVisible.value = true
      break
  }
  causa.value = { ...cau }
  submitted.value = false
  otrosCamposCausaDialog.value = true
  headerOtrosCamposCausaDialog.value = campo
}
const openCambioEstadoDialog = (cau: ICausa) => {
  cambioEstadoDialog.value = true
  causa.value = { ...cau }
  if (causa.value.estado === EstadosCausas.ACTIVA) {
    causa.value.estado = EstadosCausas.TERMINADA
  } else if (causa.value.estado === EstadosCausas.TERMINADA) {
    causa.value.estado = EstadosCausas.CONGELADA
  }

  submitted.value = false
}

const openNewParticipante = () => {
  participante.value = {} as IParticipante
  submitted.value = false
  participanteDialog.value = true
}

const hideDialog = () => {
  causaDialog.value = false
  tribunalDialog.value = false
  participanteDialog.value = false
  otrosCamposCausaDialog.value = false
  submitted.value = false

  campoObservacionEditarVisible.value = false
  campoObjetivoEditarVisible.value = false
  campoEstrategiaEditarVisible.value = false
  campoApunJuridicoEditarVisible.value = false
  campoHonorarioEditarVisible.value = false
  campoInformacionEditarVisible.value = false
  cambioEstadoDialog.value = false
}

const editParticipante = (part: IParticipante) => {
  participante.value = { ...part }
  participanteDialog.value = true
}

const confirmDeleteParticipante = (part: IParticipante) => {
  participante.value = part
  deleteParticipanteDialog.value = true
}
const editTribunal = (trib: ITribunal) => {
  tribunal.value = { ...trib }
  tribunalDialog.value = true
}
const confirmDeleteTribunal = (trib: ITribunal) => {
  tribunal.value = trib
  deleteTribunalDialog.value = true
}

const deleteTribunal = async () => {
  try {
    if (tribunal.value && tribunal.value.id) {
      await tribunalService.deleteTribunal(tribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tribunal Deleted',
        life: 3000
      })
      deleteTribunalDialog.value = false
      loadTribunalesPorCausa(idCausa)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Trubunal',
      life: 3000
    })
  }
}

const deleteParticipante = async () => {
  try {
    if (participante.value && participante.value.id) {
      await participanteService.deleteParticipante(participante.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Participante Deleted',
        life: 3000
      })
      deleteParticipanteDialog.value = false
      loadParticipantePorCausa()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete participante',
      life: 3000
    })
  }
}

const saveOtrosCamposCausa = async () => {
  submitted.value = true
  const campoActualizado: Partial<ICausa> = {}
  if (
    (headerOtrosCamposCausaDialog.value === 'Observación' && !causa.value?.observacion) ||
    (headerOtrosCamposCausaDialog.value === 'Objetivos' && !causa.value?.objetivos) ||
    (headerOtrosCamposCausaDialog.value === 'Estrategia' && !causa.value?.estrategia) ||
    (headerOtrosCamposCausaDialog.value === 'Apuntes Juridicos' &&
      !causa.value?.apuntes_juridicos) ||
    (headerOtrosCamposCausaDialog.value === 'Honorarios' && !causa.value?.apuntes_honorarios) ||
    (headerOtrosCamposCausaDialog.value === 'Información' && !causa.value?.informacion)
  )
    return
  switch (headerOtrosCamposCausaDialog.value) {
    case 'Observación':
      campoActualizado.observacion = causa.value.observacion
      break
    case 'Objetivos':
      campoActualizado.objetivos = causa.value.objetivos
      break
    case 'Estrategia':
      campoActualizado.estrategia = causa.value.estrategia
      break
    case 'Apuntes Juridicos':
      campoActualizado.apuntes_juridicos = causa.value.apuntes_juridicos
      break
    case 'Honorarios':
      campoActualizado.apuntes_honorarios = causa.value.apuntes_honorarios
      break
    case 'Información':
      campoActualizado.informacion = causa.value.informacion
      break
  }
  if (causa.value?.id) {
    campoActualizado.id = causa.value.id
  } else {
    throw new Error('id es requerido')
  }
  try {
    if (causa.value.id) {
      await CausaService.updateCausa(campoActualizado as ICausa)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Actualizado correctamente',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encuentra la causa seleccionada',
        life: 7000
      })
    }
    hideDialog()
    loadUnaCausa(idCausa)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save causa', life: 3000 })
  }
}

const saveEstadoCausa = async () => {
  submitted.value = true
  const campoActualizado: Partial<ICausa> = {}
  if (!causa.value?.estado) return
  campoActualizado.estado = causa.value.estado
  if (causa.value?.id) {
    campoActualizado.id = causa.value.id
  } else {
    throw new Error('id es requerido')
  }
  try {
    if (causa.value.id) {
      await CausaService.updateCausa(campoActualizado as ICausa)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Actualizado correctamente',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encuentra la causa seleccionada',
        life: 7000
      })
    }
    hideDialog()
    loadUnaCausa(idCausa)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
  }
}
const saveTribunal = async () => {
  submitted.value = true
  if (
    !tribunal.value?.expediente ||
    !tribunal.value?.codnurejianuj ||
    !tribunal.value?.clasetribunal_id ||
    !tribunal.value?.juzgado_id
  )
    return

  try {
    tribunal.value.causa_id = idCausa
    if (tribunal.value.id) {
      await tribunalService.updateTribunal(tribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tribunal Updated',
        life: 3000
      })
    } else {
      await tribunalService.createTribunal(tribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tribunal Created',
        life: 3000
      })
    }
    hideDialog()
    loadTribunalesPorCausa(idCausa)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
  }
}
const loadingFormParticipante = ref(false)
const saveParticipante = async () => {
  submitted.value = true
  if (
    !participante.value?.nombres ||
    !participante.value?.ultimo_domicilio ||
    !participante.value?.tipo ||
    !participante.value?.foja
  )
    return

  try {
    loadingFormParticipante.value = true // ⏳ Bloquea el modal
    participante.value.causa_id = idCausa
    if (participante.value.id) {
      await participanteService.updateParticipante(participante.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Participante Updated',
        life: 3000
      })
    } else {
      await participanteService.createParticipante(participante.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Participante Created',
        life: 3000
      })
    }
    hideDialog()
    loadParticipantePorCausa()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
  } finally {
    loadingFormParticipante.value = false // 🔓 Desbloquea el modal
  }
}
const loadTribunalesPorCausa = async (id: number) => {
  const response = await tribunalService.listarTribunalPorCausa(id)
  if (response) {
    tribunales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener tribunales de causa',
      life: 3000
    })
  }
}
const openNewWindow = async (url: string) => {
  window.open(url, '_blank')
}

const showImage = (url: string) => {
  selectedImageUrl.value = `${baseUrlResource}/${url}`
  showImageDialog.value = true
}

const selectedExpediente = ref(0)
const isExternalLink = (url: string): boolean => {
  const regex = /^(https?:\/\/)/
  return regex.test(url)
}
const mostrarExpedienteDigital = (expedienteId: number) => {
  const tribunal = tribunales.value.find((tribunal) =>
    tribunal.cuerpo_expedientes?.find(
      (expediente: ICuerpoExpediente) => expediente.id === expedienteId
    )
  )

  if (tribunal) {
    const expediente = tribunal.cuerpo_expedientes?.find(
      (expediente: ICuerpoExpediente) => expediente.id === expedienteId
    )

    if (expediente) {
      const linkCuerpo = expediente.link_cuerpo
      if (isExternalLink(linkCuerpo)) {
        // Es un enlace externo
        window.open(linkCuerpo, '_blank')
      } else {
        // Es un enlace interno
        showPDFModal.value = true
        selectedPDFUrl.value = `${baseUrlResource}/${linkCuerpo}`
      }
    }
  }
}
const modalTexCompletoVisible = ref(false)
const fullText = ref('')
const headerTextoCompleto = ref('')

const textMayorLimiteVisual = (html: string, limite: number) => {
  if (!html) {
    return false
  }
  const text = html.replace(/<[^>]+>/g, '')
  if (text.length > limite) return true
  else return false
}
const truncateHTML = (html: string, length: number) => {
  const text = html.replace(/<[^>]+>/g, '') // Remueve las etiquetas HTML para obtener texto plano
  text.slice(0, length) // Trunca el texto plano dejando solamente la cantidad de caracteres segun length
  const isTruncated = text.length > length
  let finalHTML = ''
  let charCount = 0

  const regex = /(<[^>]+>|[^<]+)/g // Match tags or text
  let match
  while ((match = regex.exec(html)) !== null && charCount < length) {
    const part = match[0]

    if (part.startsWith('<')) {
      // Si es una etiqueta HTML, la agregamos sin modificar
      finalHTML += part
    } else {
      // Si es texto, lo truncamos si excede el límite
      const remainingChars = length - charCount
      finalHTML += part.slice(0, remainingChars)
      charCount += part.length
    }
  }
  if (isTruncated) {
    finalHTML += '...'
  }
  return finalHTML
}
const viewTextCompleto = (text: string, headerModal: string) => {
  fullText.value = text
  modalTexCompletoVisible.value = true
  headerTextoCompleto.value = headerModal
}

const home = { label: 'Causas', route: { name: 'CostosOperativos' } }

const breadcrumbItems = [
  {
    label: `Detalle ${idCausa}`,
    route: { name: 'DetalleCostosOperativos', params: { id: route.params.id } }
  }
]

const items = ref<IMenuItem[]>([])

const actualizarItems = () => {
  if (isAbogadoAutorizado.value === true) {
    items.value = [
      {
        label: 'Add Tribunal',
        icon: 'pi pi-fw pi-building-columns',
        command: () => {
          openNewTribunal()
        }
      },
      {
        label: 'Add Participante',
        icon: 'pi pi-fw pi-users',
        command: () => {
          openNewParticipante()
        }
      },
      {
        label: 'Color',
        icon: 'pi pi-fw pi-palette',
        command: () => {}
      }
    ]

    if (causaSelected.value && causaSelected.value.estado === EstadosCausas.ACTIVA) {
      items.value.push({
        label: 'Terminar Causa',
        icon: 'pi pi-fw pi-power-off',
        command: () => {
          causaSelected.value ? openCambioEstadoDialog(causaSelected.value) : null
        }
      })
    }
    if (causaSelected.value && causaSelected.value.estado === EstadosCausas.TERMINADA) {
      items.value.push({
        label: 'Activar Causa',
        icon: 'pi pi-fw pi-power-off',
        command: () => {
          causaSelected.value ? openCambioEstadoDialog(causaSelected.value) : null
        }
      })
    }
  }
  //Opciones secundarias
  items.value.push(
    {
      label: 'Historigrama',
      icon: 'pi pi-fw pi-chart-line',
      command: () => {
        router.push('/historigrama/' + idCausa)
      }
    },
    {
      label: 'Imprimir',
      icon: 'pi pi-fw pi-print',
      command: () => {}
    },
    {
      label: 'Lista ordenes',
      icon: 'pi pi-fw pi-book',
      command: () => {
        router.push('/causas/ficha/lista-ordenes/' + idCausa)
      }
    }
  )
}

const itemsCamposCausa = ref([
  {
    label: 'Add Observación',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Observación') : null
    }
  },
  {
    label: 'Add Objetivos',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Objetivos') : null
    }
  },
  {
    label: 'Add Estrategia',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Estrategia') : null
    }
  },
  {
    label: 'Add Apuntes juridicos',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Apuntes Juridicos') : null
    }
  },
  {
    label: 'Add honorarios',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Honorarios') : null
    }
  },
  {
    label: 'Add información',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => {
      causaSelected.value ? openNewOtrosCamposCausa(causaSelected.value, 'Información') : null
    }
  }
])
</script>
<template>
  <DynamicBreadcrumb :home="home" :items="breadcrumbItems" class="mb-2" />

  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <DataTable
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="codigo" header="Código">
            <template #body="">
              <span class="p-column-title">Nombre</span>
              {{ causaSelected?.materia?.abreviatura }}-{{
                causaSelected?.tipo_legal?.abreviatura
              }}-{{ causaSelected?.id }}
            </template></Column
          >
          <Column field="nombre" header="Nombre del Proceso">
            <template #body="">
              <span class="p-column-title">Nombre del Proceso</span>
              {{ causaSelected?.nombre }}
            </template></Column
          >
          <Column field="abogado" header="Abogado">
            <template #body="">
              <span class="p-column-title">Abogado</span>
              {{ causaSelected?.abogado?.persona?.nombre }}
              {{ causaSelected?.abogado?.persona?.apellido }}
            </template></Column
          >
          <Column field="procurador" header="Procurador">
            <template #body="">
              <span class="p-column-title">Abogado</span>
              {{ causaSelected?.procurador?.persona?.nombre }}
              {{ causaSelected?.procurador?.persona?.apellido }}
            </template></Column
          >
        </DataTable>

        <!-- Tabla de tribunales -->
        <br />
        <DataTable
          ref="dtTribunal"
          dataKey="id"
          :value="tribunales"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="clase_tribunal" header="Fisiologia Tribunal">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Fisiologia Tribunal</span>
              {{ slotPropsTribunal.data?.clase_tribunal?.nombre }}
            </template></Column
          >
          <Column field="nombre" header="Nombre Tribunal">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Nombre Tribunal</span>
              {{ slotPropsTribunal.data?.juzgado?.nombre_numerico }}°
              {{ slotPropsTribunal.data?.juzgado?.jerarquia }}
              {{ slotPropsTribunal.data?.juzgado?.materia_juzgado }}
              {{ slotPropsTribunal.data?.juzgado?.distrito?.abreviatura }}
            </template></Column
          >
          <Column field="ubicacion" header="Ubicación">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Ubicación</span>
              <Button
                icon="pi pi-map-marker"
                style="width: 30px; height: 30px"
                class="p-button-rounded p-button-success mr-2"
                @click="openNewWindow(slotPropsTribunal.data?.juzgado?.coordenadas)"
              /> </template
          ></Column>
          <Column field="foto" header="Fachada">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Fachada</span>
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-image"
                class="p-button-rounded p-button-success mr-2"
                @click="showImage(slotPropsTribunal.data?.juzgado?.foto_url)"
              /> </template
          ></Column>
          <Column field="piso" header="Piso">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Piso</span>
              {{ slotPropsTribunal.data?.juzgado?.piso?.nombre }}
            </template>
          </Column>
          <Column field="codigo" header="# De Exp.">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Expediente</span>
              {{ slotPropsTribunal.data.expediente }}
            </template>
          </Column>

          <Column field="expedientes" header="Expedientes Digitales">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Expediente</span>
              <div class="field">
                <Dropdown
                  v-model="selectedExpediente"
                  id="expdientedigital"
                  :options="slotPropsTribunal.data.cuerpo_expedientes"
                  optionLabel="nombre"
                  optionValue="id"
                  filter
                  autofocus
                  filterPlaceholder="Buscar Exp. Digital"
                  @change="mostrarExpedienteDigital(selectedExpediente)"
                />
              </div>
            </template>
          </Column>

          <Column field="codigo" header="Código Juridico">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Código Juridico</span>
              {{ slotPropsTribunal.data.codnurejianuj }}
            </template>
          </Column>
        </DataTable>
        <br />
        <!-- Tabla de Participamtes -->
        <DataTable
          ref="dtParticipante"
          :value="participantes"
          v-model:selection="selectedParticipantes"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Participantes"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          @page="loadParticipantePorCausa"
          @sort="loadParticipantePorCausa"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Sujetos Procesales</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <Column field="id" header="ID" sortable>
            <template #body="slotPropsParticipante">
              <span class="p-column-title">Id</span>
              {{ slotPropsParticipante.data.id }}
            </template></Column
          >

          <Column field="nombres" header="Nombres" sortable>
            <template #body="slotPropsParticipante">
              <span class="p-column-title">Nombres</span>
              {{ slotPropsParticipante.data.nombres }}
            </template></Column
          >

          <Column field="ultimo_domicilio" header="Último Domicilio" sortable>
            <template #body="slotPropsParticipante">
              <span class="p-column-title">Último Domicilio</span>
              <span v-html="truncateHTML(slotPropsParticipante.data.ultimo_domicilio, 100)"></span>
              <Button
                v-if="textMayorLimiteVisual(slotPropsParticipante.data.ultimo_domicilio, 100)"
                label="Ver más"
                link
                @click="
                  viewTextCompleto(slotPropsParticipante.data.ultimo_domicilio, 'Último Domicilio')
                "
              /> </template
          ></Column>

          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotPropsParticipante">
              <span class="p-column-title">Tipo</span>
              {{ slotPropsParticipante.data.tipo }}
            </template></Column
          >
          <Column field="foja" header="Foja">
            <template #body="slotPropsParticipante">
              <span class="p-column-title">Foja</span>
              {{ slotPropsParticipante.data.foja }}
            </template></Column
          >
        </DataTable>

        <h4>Avance Financiero</h4>

        
        <u>EGRESOS</u>
        <DataTable
          ref="dt"
          :value="detalleFinanciero"
          
          dataKey="id"
          :paginator="false"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ordenes"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
        >
          <template #header>
            <div>
              <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h4 class="m-0">Detalle de egresos</h4>
              </div>
            </div>
          </template>

          <template #empty> No se encontraron registros. </template>
          <template #loading> Cargando los registros... </template>

          <!-- <Column field="id" header="Orden" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.id }}
            </template></Column
          > -->
          <Column field="id" header="Orden" style="min-width: 8rem">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.id}`"
            link
            @click="
              $router.push(
                `/detalle-costos-operativos/${idCausa}/detalle-orden/` + slotProps.data.id
              )
            "
          />
        </template>
      </Column>
          <Column field="entrega_informacion" header="Carga info." style="min-width: 8rem">
            <template #body="slotProps">
              <span
                v-if="slotProps.data.entrega_informacion"
                v-html="truncateHTML(slotProps.data.entrega_informacion, 100)"
              ></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.entrega_informacion, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.entrega_informacion, 'Carga Info.')"
              /> </template
          ></Column>
          <Column field="detalle_informacion" header="Descarga info." style="min-width: 8rem">
            <template #body="slotProps">
              <span
                v-if="slotProps.data.detalle_informacion"
                v-html="truncateHTML(slotProps.data.detalle_informacion, 100)"
              ></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.detalle_informacion, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.detalle_informacion, 'Descarga Info.')"
              /> </template
          ></Column>

          <Column field="fecha_fin" header="Fecha Fin" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.fecha_fin }}
            </template></Column
          >
          <Column field="prioridad" header="Bandera" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.prioridad }}
            </template></Column
          >
          <Column field="condicion" header="Plazo en hora" style="min-width: 8rem">
            <template #body="slotProps">
              {{ plazoSegunCondicion(slotProps.data.condicion) }}
            </template></Column
          >
          <Column field="costo_procesal_venta" header="Costo Judicial" style="min-width: 8rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.es_validado == 1">{{
                slotProps.data.costo_procesal_venta
              }}</span>
              <span v-else>??</span>
            </template></Column
          >
          <Column field="venta" header="Costo Procuraduria" style="min-width: 8rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.etapa_orden == EtapaOrden.CERRADA">{{
                slotProps.data.venta
              }}</span>
              <span v-else>{{ slotProps.data.venta }} - Por confirmar</span>
            </template></Column
          >
          <Column field="total_egreso" header="Toal egreso" style="min-width: 8rem">
            <template #body="slotProps">
               <span v-if="slotProps.data.etapa_orden == EtapaOrden.CERRADA && slotProps.data.es_validado == 1">{{ slotProps.data.total_egreso }}</span> 
               <span v-if="slotProps.data.etapa_orden == EtapaOrden.CERRADA && slotProps.data.es_validado == 0">{{ slotProps.data.venta }} - Por ahora</span>
               <span v-if="slotProps.data.etapa_orden != EtapaOrden.CERRADA">??</span>
             
            </template></Column
          >
        </DataTable>
        <br>
        
        
      </div>
    </div>
  </div>
  <OVisorImg
    :imageUrl="selectedImageUrl"
    :visible="showImageDialog"
    @update:visible="showImageDialog = $event"
    header="Vista de Imagen"
  />
  <OVisorPDFModal
    :pdfUrl="selectedPDFUrl"
    :visible="showPDFModal"
    @update:visible="showPDFModal = $event"
    header="Vista de Expediente"
  />
  <OVisorTextCompleto
    :fullText="fullText"
    :visible="modalTexCompletoVisible"
    @update:visible="modalTexCompletoVisible = $event"
    :header="headerTextoCompleto"
  />
</template>
<style scoped lang="scss">
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.field.full-width {
  grid-column: span 3;
}
.field {
  margin-bottom: 0.1rem; /* disminuir el espacio */
}
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .field.full-width {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .field.full-width {
    grid-column: span 1;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7); /* Fondo blanco con transparencia */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 10px; /* Asegura que siga la forma del modal */
}

.loading-icon {
  font-size: 4rem;
  color: #10b981;
}
</style>
