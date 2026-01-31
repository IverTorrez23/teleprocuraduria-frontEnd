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
  EstadosCausas
} from '@/constants/constants'
import type { IMenuItem } from '@/common/utils/types/menuItem.types'
import { isAbogadoAutorizado } from '@/common/utils/usuarioAutorizado'

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
const submitted = ref(false)
const pagination = ref<IPaginado>({
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
})
watch(
  () => filters.value.global.value,
  () => {
    loadParticipantePorCausa()
  }
)

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

const home = { label: 'Causas', route: { name: 'Causas' } }

const breadcrumbItems = [
  { label: `Ficha ${idCausa}`, route: { name: 'Ficha', params: { id: route.params.id } } }
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
        label: 'Add sujeto procesal',
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
  <Menubar :model="items" class="card flex p-1 mb-2" />
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

          <Column field="codigo" header="Agregar Exp. Digital" v-if="isAbogadoAutorizado">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Agregar Exp. Digital</span>

              <router-link
                :to="`/causas/ficha/tribunal/${slotPropsTribunal.data.id}/expedientedigital`"
              >
                <Button
                  style="width: 30px; height: 30px"
                  icon="pi pi-print"
                  class="p-button-rounded p-button-success mr-2"
                />
              </router-link>
            </template>
          </Column>

          <Column field="codigo" header="Código Juridico">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Código Juridico</span>
              {{ slotPropsTribunal.data.codnurejianuj }}
            </template>
          </Column>

          <Column field="codigo" header="Contacto 1">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Contacto 1</span>
              {{ slotPropsTribunal.data?.juzgado?.contacto1 }}
            </template>
          </Column>

          <Column field="codigo" header="Contacto 2">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Contacto 2</span>
              {{ slotPropsTribunal.data?.juzgado?.contacto2 }}
            </template>
          </Column>

          <Column field="codigo" header="Contacto 3">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Contacto 3</span>
              {{ slotPropsTribunal.data?.juzgado?.contacto3 }}
            </template>
          </Column>

          <Column field="codigo" header="Contacto 4">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Contacto 4</span>
              {{ slotPropsTribunal.data?.juzgado?.contacto4 }}
            </template>
          </Column>

          <Column field="tribunal_dominante" header="Tribunal Dominante">
            <template #body="slotPropsTribunal">
              <span class="p-column-title">Tribunal Dominante</span>

              <i
                v-if="slotPropsTribunal.data?.tribunal_dominante === 1"
                class="pi pi-check-circle text-green-500"
                style="font-size: 1.5rem"
              ></i>
              <i v-else class="pi pi-circle text-gray-400" style="font-size: 1.5rem"></i>
            </template>
          </Column>

          <Column header="Acciones" v-if="isAbogadoAutorizado">
            <template #body="slotPropsTribunal">
              <Button
                style="width: 30px; height: 30px"
                v-tooltip.bottom="'Editar'"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editTribunal(slotPropsTribunal.data)"
              />
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteTribunal(slotPropsTribunal.data)"
              />
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
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} sujeto procesal"
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
              <h4 class="m-0">Sujetos procesales</h4>
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

          <Column field="estado" header="Estado">
            <template #body="slotPropsParticipante">
              <Tag
                :value="slotPropsParticipante.data.estado"
                :severity="getEstado(slotPropsParticipante.data.estado)"
              /> </template
          ></Column>

          <Column header="Acciones" v-if="isAbogadoAutorizado">
            <template #body="slotPropsParticipante">
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editParticipante(slotPropsParticipante.data)"
              />
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteParticipante(slotPropsParticipante.data)"
              />
            </template>
          </Column>
        </DataTable>

        <Menubar v-if="isAbogadoAutorizado" :model="itemsCamposCausa" class="card flex p-1" />

        <h4>Espacio de la Causa</h4>
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
          <Column field="observacion" header="Observación">
            <template #body="slotPropsOtrosCamposCausa">
              <span class="p-column-title">Observación</span>
              <span v-html="slotPropsOtrosCamposCausa?.data?.observacion"></span> </template
          ></Column>
        </DataTable>
        <!-- Objetivos -->
        <DataTable
          v-if="isAbogadoAutorizado"
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="objetivos" header="Objetivos">
            <template #body="">
              <span class="p-column-title">Objetivos</span>
              <span v-html="causaSelected?.objetivos"></span> </template
          ></Column>
        </DataTable>
        <!-- Estrategias -->
        <DataTable
          v-if="isAbogadoAutorizado"
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="estrategia" header="Estrategias">
            <template #body="">
              <span class="p-column-title">Estrategias</span>
              <span v-html="causaSelected?.estrategia"></span> </template
          ></Column>
        </DataTable>
        <!-- Apuntes juridicos -->
        <DataTable
          v-if="isAbogadoAutorizado"
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="apuntes_juridicos" header="Apuntes Juridicos">
            <template #body="">
              <span class="p-column-title">Apuntes Juridicos</span>
              <span v-html="causaSelected?.apuntes_juridicos"></span> </template
          ></Column>
        </DataTable>
        <!-- Honorarios -->
        <DataTable
          v-if="isAbogadoAutorizado"
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="apuntes_honorarios" header="Honorarios">
            <template #body="">
              <span class="p-column-title">Honorarios</span>
              <span v-html="causaSelected?.apuntes_honorarios"></span> </template
          ></Column>
        </DataTable>
        <!-- Otra Informacion -->
        <DataTable
          v-if="isAbogadoAutorizado"
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="informacion" header="Información">
            <template #body="">
              <span class="p-column-title">Honorarios</span>
              <span v-html="causaSelected?.informacion"></span> </template
          ></Column>
        </DataTable>

        <!-- create and edit modal Tribunal-->
        <Dialog
          v-model:visible="tribunalDialog"
          :style="{ width: '450px' }"
          header="Tribunal"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="Tipo_tribunal">Tipo Tribunal</label>
            <Dropdown
              id="clasetribunal_id"
              v-model="tribunal.clasetribunal_id"
              :options="claseTribunales"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Tipo Tribunal"
              :invalid="submitted && !tribunal.clasetribunal_id"
            />
            <small class="p-error" v-if="submitted && !tribunal.clasetribunal_id"
              >Tipo Tribunal es requerido.</small
            >
          </div>

          <div class="field">
            <label for="juzgado">Juzgado</label>
            <Dropdown
              id="juzgado_id"
              v-model="tribunal.juzgado_id"
              :options="juzgados"
              optionLabel="nombreJuzgado"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Juzgado"
              :invalid="submitted && !tribunal?.juzgado_id"
            />
            <small class="p-error" v-if="submitted && !tribunal?.juzgado_id"
              >Juzgado es requerido.</small
            >
          </div>

          <div class="field">
            <label for="expediente">N° Exp.</label>
            <InputText
              id="expediente"
              v-model.trim="tribunal.expediente"
              required="true"
              autofocus
              :invalid="submitted && !tribunal?.expediente"
            />
            <small class="p-error" v-if="submitted && !tribunal?.expediente"
              >Número de Expediente es requerido.</small
            >
          </div>

          <div class="field">
            <label for="expediente">Código Judicial</label>
            <InputText
              id="codnurejianuj"
              v-model.trim="tribunal.codnurejianuj"
              required="true"
              autofocus
              :invalid="submitted && !tribunal?.codnurejianuj"
            />
            <small class="p-error" v-if="submitted && !tribunal?.codnurejianuj"
              >Código Judicial es requerido.</small
            >
          </div>
          <br />
          <div class="field">
            <!-- <Checkbox
              v-model="tribunal.tribunal_dominante"
              :true-value="1"
              :false-value="0"
              indeterminate
              binary
            />
            <label for="expediente">Tribunal Dominante</label> -->
            <div class="flex align-items-center">
              <Checkbox
                v-model="tribunal.tribunal_dominante"
                :true-value="1"
                :false-value="0"
                indeterminate
                binary
              />
              <label for="tribunal_dominante" class="ml-2">Es Tribunal Dominante ? </label>
            </div>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveTribunal" />
          </template>
        </Dialog>

        <!-- dialog delete tribunal -->
        <Dialog
          v-model:visible="deleteTribunalDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="tribunal"
              >¿Estás seguro que quieres eliminar el tribunal
              <b
                >{{ tribunal?.juzgado?.nombre_numerico }}°
                {{ tribunal?.juzgado?.jerarquia }}
                {{ tribunal?.juzgado?.materia_juzgado }}
                {{ tribunal?.juzgado?.distrito?.abreviatura }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteTribunalDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteTribunal" />
          </template>
        </Dialog>

        <!-- create and edit modal Participantes-->
        <Dialog
          v-model:visible="participanteDialog"
          :style="{ width: '550px' }"
          header="Participante"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombres">Nombres</label>
            <InputText
              id="nombres"
              v-model.trim="participante.nombres"
              required="true"
              autofocus
              :invalid="submitted && !participante?.nombres"
            />
            <small class="p-error" v-if="submitted && !participante?.nombres"
              >Nombres es requerido.</small
            >
          </div>

          <div class="field">
            <label for="tipo">Tipo</label>
            <Dropdown
              id="tipo"
              v-model="participante.tipo"
              :options="TipoParticipante"
              optionLabel="label"
              optionValue="value"
              filter
              filterPlaceholder="Buscar Tipo"
              :invalid="submitted && !participante?.tipo"
            />
            <small class="p-error" v-if="submitted && !participante?.tipo"
              >Tipo es requerido.</small
            >
          </div>

          <div class="field full-width">
            <label for="ultimo_domicilio">Último Domicilio</label>
            <Editor
              id="ultimo_domicilio"
              v-model="participante.ultimo_domicilio"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !participante.ultimo_domicilio"
            />
            <small class="p-error" v-if="submitted && !participante.ultimo_domicilio"
              >Último domicilio es requerido.</small
            >
          </div>

          <div class="field">
            <label for="foja">Foja</label>
            <InputText
              id="foja"
              v-model.trim="participante.foja"
              required="true"
              autofocus
              :invalid="submitted && !participante?.foja"
            />
            <small class="p-error" v-if="submitted && !participante?.foja"
              >Foja es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveParticipante"
            />
          </template>
          <!-- Overlay de carga -->
          <div v-if="loadingFormParticipante" class="overlay">
            <i class="pi pi-spin pi-spinner loading-icon"></i>
          </div>
        </Dialog>

        <!-- dialog delete participante -->
        <Dialog
          v-model:visible="deleteParticipanteDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="participante"
              >¿Estás seguro que quieres eliminar al participante
              <b>{{ participante?.nombres }} </b>?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteParticipanteDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteParticipante"
            />
          </template>
        </Dialog>

        <!-- Dialog otros campos causa-->
        <Dialog
          v-model:visible="otrosCamposCausaDialog"
          :style="{ width: '550px' }"
          :header="headerOtrosCamposCausaDialog"
          :modal="true"
          class="p-fluid"
        >
          <div class="field full-width" v-if="campoObservacionEditarVisible">
            <label for="observacion">Observación</label>
            <Editor
              id="observacion"
              v-model="causa.observacion"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.observacion"
            />
            <small class="p-error" v-if="submitted && !causa?.observacion"
              >Observación es requerido.</small
            >
          </div>

          <div class="field full-width" v-if="campoObjetivoEditarVisible">
            <label for="objetivos">Objetivos</label>
            <Editor
              id="objetivos"
              v-model="causa.objetivos"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.objetivos"
            />
            <small class="p-error" v-if="submitted && !causa?.objetivos"
              >Objetivos es requerido.</small
            >
          </div>

          <div class="field full-width" v-if="campoEstrategiaEditarVisible">
            <label for="estrategia">Estrategias</label>
            <Editor
              id="estrategia"
              v-model="causa.estrategia"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.estrategia"
            />
            <small class="p-error" v-if="submitted && !causa?.estrategia"
              >Estrategias es requerido.</small
            >
          </div>

          <div class="field full-width" v-if="campoApunJuridicoEditarVisible">
            <label for="apuntes_juridicos">Apuntes Juridicos</label>
            <Editor
              id="apuntes_juridicos"
              v-model="causa.apuntes_juridicos"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.apuntes_juridicos"
            />
            <small class="p-error" v-if="submitted && !causa?.apuntes_juridicos"
              >Apuntes Juridicos es requerido.</small
            >
          </div>

          <div class="field full-width" v-if="campoHonorarioEditarVisible">
            <label for="apuntes_honorarios">Honorario</label>
            <Editor
              id="apuntes_honorarios"
              v-model="causa.apuntes_honorarios"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.apuntes_honorarios"
            />
            <small class="p-error" v-if="submitted && !causa?.apuntes_honorarios"
              >Honorario es requerido.</small
            >
          </div>

          <div class="field full-width" v-if="campoInformacionEditarVisible">
            <label for="informacion">Información</label>
            <Editor
              id="informacion"
              v-model="causa.informacion"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !causa?.informacion"
            />
            <small class="p-error" v-if="submitted && !causa?.informacion"
              >Información es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveOtrosCamposCausa"
            />
          </template>
        </Dialog>
        <!-- Dialog cambio estado causa -->
        <Dialog
          v-model:visible="cambioEstadoDialog"
          :style="{ width: '550px' }"
          header="Cambio de estado"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="estado">Se actualizara el estado a:</label>
            <InputText
              id="estado"
              v-model.trim="causa.estado"
              required="true"
              :readonly="true"
              autofocus
              :invalid="submitted && !causa?.estado"
            />
            <small class="p-error" v-if="submitted && !causa?.estado">Estado es requerido.</small>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveEstadoCausa"
            />
          </template>
        </Dialog>
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
