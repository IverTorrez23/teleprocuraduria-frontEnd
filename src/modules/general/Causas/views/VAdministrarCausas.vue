<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import CausaService from '../services/causa.service'
import type { ICausa } from '../types/causa.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { IMateria } from '@/modules/admin/Materia/materia.types'
import materiaService from '@/modules/admin/Materia/services/materia.service'
import tipoLegalService from '@/modules/admin/TipoLegal/services/tipo-legal.service'
import type { ITipoLegal } from '@/modules/admin/TipoLegal/tipo-lega.types'
import type { ICategorias } from '@/modules/admin/Categorias/categorias.types'
import categoriasService from '@/modules/admin/Categorias/services/categorias.service'
import type { IPlantilla } from '@/modules/admin/Plantilla/types/plantilla.types'
import plantillaService from '@/modules/admin/Plantilla/services/plantilla.service'
import type { IUsuario } from '../../Usuarios/types/usuario.types'
import usuarioService from '../../Usuarios/services/usuario.service'
import {
  TinymceApiKey,
  TinymceConfig,
  TableSize,
  TipoUsuario,
  EstadosCausas,
  TipoParticipante
} from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import {
  isUsuarioAutorizado,
  isAbogadoAutorizado,
  isAbogadoINDEPEN_DEPEN
} from '@/common/utils/usuarioAutorizado'
import useItemsContadorOrden from '@/common/utils/useItemsContadorOrden'
import type { ICodigosCausa } from '../types/codigos.types'
import type { IParticipante } from '../../Participantes/types/participante.types'
import participanteService from '../../Participantes/services/participante.service'
import type { ITribunal } from '../../Tribunal/types/tribunal.types'
import type { IClaseTribunal } from '@/modules/admin/ClaseTribunal/types/clase-tribunal.types'
import claseTribunalService from '@/modules/admin/ClaseTribunal/services/clase-tribunal.service'
import type { IJuzgado } from '@/modules/admin/Juzgados/types/juzgado.types'
import juzgadoService from '@/modules/admin/Juzgados/services/juzgado.service'
import tribunalService from '../../Tribunal/services/tribunal.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const route = useRoute()
const orderby = route.query.orderby

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

const toast = useToast()
const dt = ref()
const causas = ref<ICausa[]>([])
const causaDialog = ref(false)
const deleteCausaDialog = ref(false)
const deleteCausasDialog = ref(false)
const cambioEstadoDialog = ref(false)
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

const materias = ref<IMateria[]>([])
const tipoLegales = ref<ITipoLegal[]>([])
const categorias = ref<ICategorias[]>([])
const selectedCausas = ref<ICausa[]>([])
const plantillas = ref<IPlantilla[]>([])
const abogados = ref<IUsuario[]>([])
const procuradores = ref<IUsuario[]>([])
const codigosCausa = ref<ICodigosCausa[]>([])
const codigoSeleccionadoFiltro = ref<number | null>(null)
const procuradorSeleccionadoFiltro = ref<number | null>(null)
const categoriaSeleccionadoFiltro = ref<number | null>(null)
const abogadoSeleccionadoFiltro = ref<number | null>(null)
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

const loadCausas = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombre', 'observacion'], keyword: filters.value.global.value }]
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
  const response = await CausaService.getCausasAdministrar(opciones)

  causas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}
const loadMaterias = async () => {
  const response = await materiaService.listarMaterias()
  if (response) {
    materias.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch materias',
      life: 3000
    })
  }
}

const filtradoPorCodigo = async () => {
  console.log('Código seleccionado:', codigoSeleccionadoFiltro.value)
  procuradorSeleccionadoFiltro.value = null
  categoriaSeleccionadoFiltro.value = null
  abogadoSeleccionadoFiltro.value = null
}
const filtradoPorProcurador = async () => {
  console.log('Procurador seleccionado:', procuradorSeleccionadoFiltro.value)
  categoriaSeleccionadoFiltro.value = null
  abogadoSeleccionadoFiltro.value = null
  codigoSeleccionadoFiltro.value = null
}
const filtradoPorCategoria = async () => {
  console.log('Categoria seleccionado:', categoriaSeleccionadoFiltro.value)
  abogadoSeleccionadoFiltro.value = null
  codigoSeleccionadoFiltro.value = null
  procuradorSeleccionadoFiltro.value = null
}
const filtradoPorAbogado = async () => {
  console.log('abogado seleccionado:', abogadoSeleccionadoFiltro.value)
  codigoSeleccionadoFiltro.value = null
  procuradorSeleccionadoFiltro.value = null
  categoriaSeleccionadoFiltro.value = null
}
const loadTipoLegalesPorMateria = async (id: number) => {
  causa.value.tipolegal_id = undefined
  const response = await tipoLegalService.listarTipoLegasPorMateriaId(id)
  if (response) {
    tipoLegales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Tipo legal',
      life: 3000
    })
  }
}

const loadParticipantesDeCausa = async (id: number) => {
  const response = await participanteService.listarPorCausa(id)
  if (response) {
    participantes.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch participantes de una causa',
      life: 3000
    })
  }
}

const loadTribunalesDeCausa = async (id: number) => {
  const response = await tribunalService.listarTribunalPorCausaId(id)
  if (response) {
    tribunales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch tribunales de una causa',
      life: 3000
    })
  }
}
const loadTipoLegalesConMateria = async () => {
  const response = await tipoLegalService.listarTipoLegalConMateria()
  if (response) {
    codigosCausa.value =
      response.data?.map((codigo: any) => ({
        ...codigo,
        codigos: `${codigo.materia.abreviatura || ''}-${codigo.abreviatura || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Codigos',
      life: 3000
    })
  }
}

const loadCategorias = async () => {
  const response = await categoriasService.listarCategorias()
  if (response) {
    categorias.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch categorias',
      life: 3000
    })
  }
}
const loadPlantillas = async () => {
  const response = await plantillaService.listarPlantillas()
  if (response) {
    plantillas.value = [
      {
        id: 0,
        nombre: 'Sin plantilla',
        estado: '',
        es_eliminado: 0,
        created_at: '',
        updated_at: ''
      },
      ...response
    ]
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch plantillas',
      life: 3000
    })
  }
}

const loadAbogados = async () => {
  const result = await usuarioService.listarUsuariosAbogados()

  if (result.success) {
    abogados.value = []
    if (Array.isArray(result.data) && result.data.length > 0) {
      // Mapeamos los abogados obtenidos desde el servicio
      abogados.value = result.data.map((abogado) => ({
        ...abogado,
        nombreCompleto: `${abogado.persona?.nombre || ''} ${abogado.persona?.apellido || ''}`
      }))
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener los abogados.',
      life: 3000
    })
  }

  // Si hay un usuario logueado, lo agregamos después de cargar los abogados
  if (usuario.value && isAbogadoAutorizado.value) {
    const usuarioLogueado = {
      id: usuario.value.id,
      name: usuario.value.name,
      email: usuario.value.email,
      password: '',
      email_verified_at: null,
      tipo: usuario.value.tipo,
      abogado_id: 0,
      opciones_moto: [''],
      estado: usuario.value.estado ? '' : '',
      es_eliminado: 0,
      created_at: '',
      updated_at: '',
      persona: null,
      nombreCompleto: `${usuario.value.persona?.nombre} (Usted)`
    }

    abogados.value.unshift(usuarioLogueado) // Lo agregamos al inicio de la lista
  }
}

const loadProcuradores = async () => {
  const result = await usuarioService.listarUsuariosProcurador()

  if (result.data) {
    procuradores.value =
      result.data?.map((procurador) => ({
        ...procurador,
        nombreCompleto: `${procurador.persona?.nombre || ''} ${procurador.persona?.apellido || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener los procuradores.',
      life: 3000
    })
  }
}
const billeteraIndividual = ref(0)
const billeteraGeneral = ref(1)
const onCheckboxChange = (tipo: "general" | "individual") => {
  /*const target = event.target as HTMLInputElement
  if (target.checked) {
    causa.value.tiene_billetera = 1
  } else {
    causa.value.tiene_billetera = 0
  }*/

  if (tipo === "general") {
    // Si marcó la general, desmarca la individual
    if (billeteraGeneral.value === 1) {
      billeteraIndividual.value = 0;
      causa.value.tiene_billetera = 0
    }
  } else if (tipo === "individual") {
    // Si marcó la individual, desmarca la general
    if (billeteraIndividual.value === 1) {
      billeteraGeneral.value = 0;
      causa.value.tiene_billetera = 1
    }
  }
}
const { loadCantidadEtapasOrden } = useItemsContadorOrden()

onMounted(() => {
  loadCausas()
  loadMaterias()
  loadCategorias()
  loadPlantillas()
  loadAbogados()
  loadProcuradores()
  loadCantidadEtapasOrden()
  console.log('Valor de orderby:', orderby)
  loadTipoLegalesConMateria()
  loadClaseTribunales()
  loadJuzgados()
  console.log('datos user', usuario.value)
})
watch(
  () => filters.value.global.value,
  () => {
    loadCausas()
  }
)

watch(
  () => route.query.orderby,
  (newOrderby) => {
    console.log('El valor de orderby cambió a:', newOrderby)
  }
)
const openNew = () => {
  causa.value = {} as ICausa
  causa.value.tiene_billetera = 0 //por defecto se marca sin billetera
  submitted.value = false
  causaDialog.value = true
  participantes.value = []
  tribunales.value = []

  if (isAbogadoINDEPEN_DEPEN.value && usuario.value?.id) {
    causa.value.abogado_id = usuario.value.id
  }
}

const hideDialog = () => {
  causaDialog.value = false
  cambioEstadoDialog.value = false
  submitted.value = false
}

const editCausa = async (cau: ICausa) => {
  loadTipoLegalesPorMateria(cau.materia_id)
  deshabilitadoBtnAddParticip.value = true
  deshabilitadoBtnAddTribunal.value = true
  causa.value = { ...cau }
  causaDialog.value = true
  await loadParticipantesDeCausa(cau.id)
  deshabilitadoBtnAddParticip.value = false
  await loadTribunalesDeCausa(cau.id)
  deshabilitadoBtnAddTribunal.value = false
  participantesEliminados.value = []
  tribunalesEliminados.value = []
}

const confirmDeleteCausa = (cau: ICausa) => {
  causa.value = cau
  causa.value.estado = EstadosCausas.TERMINADA
  cambioEstadoDialog.value = true
}

const deleteCausa = async () => {
  try {
    if (causa.value && causa.value.id) {
      await CausaService.deleteCausa(causa.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Causa Deleted',
        life: 3000
      })
      deleteCausaDialog.value = false
      loadCausas()
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 5000
    })
  }
}

const deleteSelectedCausas = () => {
  causas.value = causas.value.filter((val) => !selectedCausas.value.includes(val))
  deleteCausasDialog.value = false
  selectedCausas.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Causas Deleted',
    life: 3000
  })
}
const loadingButton = ref(false)
const saveCausa = async () => {
  submitted.value = true
  if (
    !causa.value?.nombre ||
    !causa.value?.observacion ||
    !causa.value?.materia_id ||
    !causa.value?.tipolegal_id ||
    !causa.value?.categoria_id
  )
    return
  loadingButton.value = true // ⏳ Bloquea el botón y muestra el spinner
  try {
    if (causa.value.id) {
      //Actualizacion de datos
      await CausaService.updateCausa(causa.value)
      //Participantes update or create
      await Promise.all(
        participantes.value.map((participante) => {
          if (participante.id) {
            return participanteService.updateParticipante(participante)
          } else {
            participante.causa_id = causa.value.id
            return participanteService.createParticipante(participante)
          }
        })
      )
      //Elimina participantes seleccionados
      if (participantesEliminados.value.length > 0) {
        await Promise.all(
          participantesEliminados.value.map((participanteEliminado) => {
            return participanteService.deleteParticipante(participanteEliminado)
          })
        )
      }

      //Tribunales update o create
      await Promise.all(
        tribunales.value.map((tribunal) => {
          if (tribunal.id) {
            return tribunalService.updateTribunal(tribunal)
          } else {
            tribunal.causa_id = causa.value.id
            return tribunalService.createTribunal(tribunal)
          }
        })
      )
      //Elimina tribunales seleccionados
      if (tribunalesEliminados.value.length > 0) {
        await Promise.all(
          tribunalesEliminados.value.map((tribunalEliminado) => {
            return tribunalService.deleteTribunal(tribunalEliminado)
          })
        )
      }

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'causa Updated',
        life: 3000
      })
    } else {
      if (causa.value.tiene_billetera) {
        causa.value.tiene_billetera = 1
      } else {
        causa.value.tiene_billetera = 0
      }
      const response = await CausaService.createCausa(causa.value)
      if (response?.id) {
        //Registro de participantes
        await Promise.all(
          participantes.value.map((participante) => {
            participante.causa_id = response.id
            return participanteService.createParticipante(participante)
          })
        )
        //Registro de tribunales
        await Promise.all(
          tribunales.value.map((tribunal) => {
            tribunal.causa_id = response.id
            return tribunalService.createTribunal(tribunal)
          })
        )
      }
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'causa Created',
        life: 3000
      })
    }
    hideDialog()
    loadCausas()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
  } finally {
    loadingButton.value = false // ✅ Habilita el botón después de guardar
  }
}

//Para visualizacion de textos completos
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
        detail: 'Terminado correctamente',
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
    loadCausas()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
  }
}

const participantes = ref<IParticipante[]>([])
const participantesEliminados = ref<IParticipante[]>([])
const deshabilitadoBtnAddParticip = ref(false)

const agregarParticipante = () => {
  participantes.value.push({
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
}

const eliminarParticipante = (index: number) => {
  const eliminado = participantes.value[index] // Obtiene el elemento a eliminar
  if (eliminado.id) {
    participantesEliminados.value.push(eliminado) // Guarda en participantesEliminados
  }
  participantes.value.splice(index, 1)
}

//Tribunales
const claseTribunales = ref<IClaseTribunal[]>([])
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

const juzgados = ref<IJuzgado[]>([])
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

const tribunales = ref<ITribunal[]>([])
const tribunalesEliminados = ref<ITribunal[]>([])
const deshabilitadoBtnAddTribunal = ref(false)

const agregarTribunal = () => {
  console.log('tribunales', tribunales.value.length)
  let valorDominante = 0
  if(tribunales.value.length === 0){
    valorDominante = 1
  }
  tribunales.value.push({
    id: 0,
    expediente: '',
    codnurejianuj: '',
    link_carpeta: '',
    clasetribunal_id: 0,
    causa_id: 0,
    juzgado_id: 0,
    tribunal_dominante: valorDominante,
    estado: '',
    es_eliminado: 0,
    created_at: '',
    updated_at: ''
  })
}
const eliminarTribunal = (index: number) => {
  const eliminado = tribunales.value[index] // Obtiene el elemento a eliminar
  if (eliminado.id) {
    tribunalesEliminados.value.push(eliminado) // Guarda en tribunalesEliminados
  }
  tribunales.value.splice(index, 1)
}

const seleccionarTribunalDominante = (indexMarcado: number) => {
  tribunales.value.forEach((tribunal, index) => {
    tribunal.tribunal_dominante = index === indexMarcado ? 1 : 0
  })
}
</script>
<template>
  <div class="card p-3">
    <Toast />
    <Toolbar class="mb-4" v-if="isAbogadoAutorizado">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
    </Toolbar>
    <Toolbar class="mb-4" v-if="usuario?.tipo === TipoUsuario.CONTADOR">
      <template #start>
        <Button
          label="ENTREGAR MUCHOS"
          icon="pi pi-plus"
          severity="success"
          class="mr-2"
          @click="$router.push('/causas/entregar-presupuesto')"
        />
      </template>
      <template #end>
        <Button
          label="DEVOLVER MUCHOS"
          icon="pi pi-plus"
          severity="success"
          class="mr-2"
          @click="$router.push('/causas/devolver-presupuesto')"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="causas"
      v-model:selection="selectedCausas"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} causas"
      :autoLayout="true"
      :lazy="true"
      :size="TableSize.small"
      @page="loadCausas"
      @sort="loadCausas"
    >
      <template #header>
        <div>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Causas</h4>

            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters.global.value" placeholder="Buscar..." />
            </IconField>
          </div>
        </div>
      </template>

      <template #empty> No se encontraron registros. </template>
      <template #loading> Cargando los registros... </template>

      <Column field="codigo" header="Código" sortable style="min-width: 9rem">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.materia.abreviatura}-${slotProps.data.tipo_legal.abreviatura}-${slotProps.data.id}`"
            link
            @click="$router.push({ path: '/causas/ficha/' + slotProps.data.id })"
          />
        </template>
      </Column>

      <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>

      <Column field="observacion" header="Observación" sortable style="min-width: 12rem">
        <template #body="slotProps">
          <span v-html="truncateHTML(slotProps.data.observacion, 100)"></span>
          <Button
            v-if="textMayorLimiteVisual(slotProps.data.observacion, 100)"
            label="Ver más"
            link
            @click="viewTextCompleto(slotProps.data.observacion, 'Observación')"
          /> </template
      ></Column>

      <Column field="tiene_billetera" header="Alimentada por Billetera:" style="min-width: 8rem">
        <template #body="slotProps">
          {{
            slotProps.data.tiene_billetera === 1
              ? 'Independiente'
              : slotProps.data.tiene_billetera === 0
                ? 'General'
                : 'No definido'
          }}
        </template></Column
      >

      <Column field="estado" header="Estado" sortable style="min-width: 6rem">
        <template #body="slotProps">
          <Tag :value="slotProps.data.estado" :severity="getEstado(slotProps.data.estado)" />
          <!-- <i v-if="slotProps.data.estado === 'CONGELADA'"> {{ slotProps.data.motivo_congelada }}</i> -->
          <small
            v-if="slotProps.data.estado === EstadosCausas.BLOQUEADA"
            style="font-size: 0.75rem; color: black"
          >
            {{ slotProps.data.motivo_congelada }}</small
          >
        </template>
      </Column>
      <Column
        header="Acciones"
        style="min-width: 8rem"
        headerClass="flex justify-content-center align-items-center"
        v-if="isUsuarioAutorizado"
      >
        <template #body="slotProps">
          <div class="flex justify-content-center align-items-center gap-2">
            <Button
              style="width: 30px; height: 30px"
              v-tooltip.bottom="'Editar'"
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success mr-2"
              @click="editCausa(slotProps.data)"
            />
            <Button
              style="width: 30px; height: 30px"
              v-tooltip.bottom="'Terminar'"
              icon="pi pi-times-circle"
              rounded
              severity="danger"
              @click="confirmDeleteCausa(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- create and edit modal -->
    <Dialog
      v-model:visible="causaDialog"
      :style="{ width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none' }"
      header="Causa"
      :modal="true"
      class="p-fluid full-screen-dialog"
    >
      <div class="grid-container" style="padding-top: 5px">
        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="materia_id"
              v-model="causa.materia_id"
              :options="materias"
              optionLabel="nombre"
              optionValue="id"
              filter
              autofocus
              filterPlaceholder="Buscar Materia"
              :invalid="submitted && !causa.materia_id"
              @change="loadTipoLegalesPorMateria(causa.materia_id)"
            />
            <label for="on_label">Materia</label>
          </FloatLabel>
          <small class="p-error" v-if="submitted && !causa.materia_id">Materia es requerido.</small>
        </div>

        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="tipolegal_id"
              v-model="causa.tipolegal_id"
              :options="tipoLegales"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Tipo legal"
              :invalid="submitted && !causa.tipolegal_id"
            />
            <label for="tipolegal_id">Tipo Legal</label>
          </FloatLabel>
          <small class="p-error" v-if="submitted && !causa.tipolegal_id"
            >Tipo legal es requerido.</small
          >
        </div>

        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="categoria_id"
              v-model="causa.categoria_id"
              :options="categorias"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar sector"
              :invalid="submitted && !causa.categoria_id"
            />
            <label for="categoria_id">Sector</label>
          </FloatLabel>
          <small class="p-error" v-if="submitted && !causa.categoria_id"
            >Categoría es requerido.</small
          >
        </div>

        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="plantilla_id"
              v-model="causa.plantilla_id"
              :options="plantillas"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Plantilla"
            />
            <label for="plantilla_id">Plantillas</label>
          </FloatLabel>
        </div>

        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="abogado_id"
              v-model="causa.abogado_id"
              :options="abogados"
              optionLabel="nombreCompleto"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Abogado"
              :invalid="submitted && !causa.abogado_id"
              :disabled="isAbogadoINDEPEN_DEPEN"
            />
            <label for="abogado_id">Abogado</label>
          </FloatLabel>
          <small class="p-error" v-if="submitted && !causa.abogado_id">Abogado es requerido.</small>
        </div>

        <div class="field">
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="procurador_id"
              v-model="causa.procurador_id"
              :options="procuradores"
              optionLabel="nombreCompleto"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Procurador"
              :invalid="submitted && !causa.procurador_id"
            />
            <label for="procurador_id">Procurador</label>
          </FloatLabel>
          <small class="p-error" v-if="submitted && !causa.procurador_id"
            >Procurador es requerido.</small
          >
        </div>

        <div class="field">
          <label for="nombre">Nombre de la causa</label>
          <InputText
            id="nombre"
            v-model.trim="causa.nombre"
            required="true"
            :invalid="submitted && !causa.nombre"
          />
          <small class="p-error" v-if="submitted && !causa.nombre">Nombre es requerido.</small>
        </div>

        <div class="field">
          <label for="color">Color</label>
          <br />
          <ColorPicker
            id="color"
            v-model="causa.color"
            inputId="cp-hex"
            format="hex"
            class="mb-4"
          />
        </div>

        <div class="field" v-if="!causa.id">
          <label for="tiene_billetera">Billetera</label>
          <div
            class="flex items-center"
            v-tooltip="'Este dato ya no se podrá modificar.'"
            style="width: 60%"
          >
            <Checkbox
              v-model="billeteraGeneral"
              :true-value="1"
              :false-value="0"
              indeterminate
              binary
              @change="onCheckboxChange('general')"
            />
            &nbsp;
            <Tag value='Debitar desde la Billetera General de causas' severity="info" />

            <Checkbox
              v-model="billeteraIndividual"
              :true-value="1"
              :false-value="0"
              indeterminate
              binary
              @change="onCheckboxChange('individual')"
            />
            &nbsp;
            <Tag value='Se crea una Billetera Individual para esta causa.' severity="info" />
          </div>
        </div>
        <hr class="mb-1 mx-0 border-top-1 border-none surface-border mt-auto field full-width" />
        <Button
          icon="pi pi-plus-circle"
          label="Agregar sujeto procesal"
          size="small"
          @click="agregarParticipante"
          :disabled="deshabilitadoBtnAddParticip"
        />
        <!-- Campos dinámicos de participantes -->
        <div
          v-for="(participante, index) in participantes"
          :key="index"
          class="field full-width flex items-center gap-2"
        >
          <FloatLabel class="w-full md:w-56">
            <InputText
              v-model="participante.nombres"
              placeholder="Nombres"
              class="w-full"
              style="width: 10%"
              :invalid="submitted && !participante.nombres"
            />
            <label for="nombre_participante">Nombre</label>
            <small class="p-error" v-if="submitted && !participante?.nombres"
              >Nombre es requerido.</small
            >
          </FloatLabel>

          <FloatLabel  style="width: 400px">
            <Dropdown
              id="tipo"
              v-model="participante.tipo"
              :options="TipoParticipante"
              optionLabel="label"
              optionValue="value"
              filter
              filterPlaceholder="Buscar Tipo"
              :invalid="submitted && !participante.tipo"
              class="w-full"
              style="width: 20%"
            />
            <label for="tipo_participante">Tipo</label>
            <small class="p-error" v-if="submitted && !participante?.tipo"
              >Tipo es requerido.</small
            >
          </FloatLabel>

          <FloatLabel class="w-full md:w-56">
            <InputText
              v-model="participante.ultimo_domicilio"
              placeholder="Ultimo domicilio"
              class="w-full"
              style="width: 50%"
              :invalid="submitted && !participante.ultimo_domicilio"
            />
            <label for="ultimo_domicilio">Ultimo domicilio</label>
            <small class="p-error" v-if="submitted && !participante?.ultimo_domicilio"
              >Ultimo domicilio es requerido.</small
            >
          </FloatLabel>

          <FloatLabel style="width: 200px">
            <InputText
              v-model="participante.foja"
              placeholder="Foja"
              
              :invalid="submitted && !participante.foja"
            />
            <label for="foja">Foja</label>
            <small class="p-error" v-if="submitted && !participante?.foja"
              >Foja es requerido.</small
            >
          </FloatLabel>
          <!-- Botón para eliminar la fila -->
          <div>
            <Button
              style="width: 30%"
              icon="pi pi-trash"
              class="p-button-danger p-button-text w-full"
              @click="eliminarParticipante(index)"
            />
          </div>
        </div>
        <!-- Seccion para agregar tribunales -->
        <hr class="mb-1 mx-0 border-top-1 border-none surface-border mt-auto field full-width" />
        <Button
          icon="pi pi-plus-circle"
          label="Agregar Tribunal"
          size="small"
          @click="agregarTribunal"
          :disabled="deshabilitadoBtnAddTribunal"
        />

        <div
          v-for="(tribunal, index) in tribunales"
          :key="index"
          class="field full-width flex items-center gap-2"
        >
          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="clasetribunal_id"
              v-model="tribunal.clasetribunal_id"
              :options="claseTribunales"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Tipo"
              :invalid="submitted && !tribunal.clasetribunal_id"
              class="w-full"
              style="width: 20%"
            />
            <label for="toi_tribunal">Tipo Tribunal</label>
            <small class="p-error" v-if="submitted && !tribunal?.clasetribunal_id"
              >Tipo Tribunal es requerido.</small
            >
          </FloatLabel>

          <FloatLabel class="w-full md:w-56">
            <Dropdown
              id="juzgado_id"
              v-model="tribunal.juzgado_id"
              :options="juzgados"
              optionLabel="nombreJuzgado"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Juzgado"
              :invalid="submitted && !tribunal.juzgado_id"
              class="w-full"
              style="width: 20%"
            />
            <label for="Juzgado">Juzgado</label>
            <small class="p-error" v-if="submitted && !tribunal?.juzgado_id"
              >Juzgado es requerido.</small
            >
          </FloatLabel>

          <FloatLabel class="w-full md:w-56">
            <InputText
              id="expediente"
              v-model="tribunal.expediente"
              required="true"
              class="w-full"
              style="width: 10%"
              autofocus
              :invalid="submitted && !tribunal?.expediente"
            />
            <label for="numero_expediente">N° Exp.</label>
            <small class="p-error" v-if="submitted && !tribunal?.expediente"
              >Número de Expediente es requerido.</small
            >
          </FloatLabel>

          <FloatLabel class="w-full md:w-56">
            <InputText
              id="codnurejianuj"
              v-model="tribunal.codnurejianuj"
              class="w-full"
              required="true"
              autofocus
              :invalid="submitted && !tribunal?.codnurejianuj"
              style="width: 50%"
            />
            <label for="codigo_juridico">Código Judicial</label>
            <small class="p-error" v-if="submitted && !tribunal?.codnurejianuj"
              >Código Judicial es requerido.</small
            >
          </FloatLabel>
          <div style="width: 700px">
            <Checkbox
              v-model="tribunal.tribunal_dominante"
              :true-value="1"
              :false-value="0"
              indeterminate
              binary
              @change="seleccionarTribunalDominante(index)"
            />
            &nbsp;
            <Tag value="Tribunal dominante" severity="info" />
          </div>
          <!-- Botón para eliminar la fila -->
          <div>
            <Button
              style="width: 30%"
              icon="pi pi-trash"
              class="p-button-danger p-button-text w-full"
              @click="eliminarTribunal(index)"
            />
          </div>
        </div>

        <div class="field full-width">
          <label for="observacion">Observacion</label>
          <Editor
            id="observacion"
            :api-key="TinymceApiKey"
            v-model="causa.observacion"
            :init="TinymceConfig"
            required="true"
            :invalid="submitted && !causa.observacion"
          />
          <small class="p-error" v-if="submitted && !causa.observacion"
            >Observacion es requerido.</small
          >
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          :disabled="loadingButton"
          @click="hideDialog"
        />
        <Button
          :label="loadingButton ? 'Saving...' : 'Save'"
          :icon="loadingButton ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          :disabled="loadingButton"
          class="p-button-text"
          @click="saveCausa"
        />
      </template>

      <!-- Overlay de carga -->
      <div v-if="loadingButton" class="overlay">
        <i class="pi pi-spin pi-spinner loading-icon"></i>
      </div>
    </Dialog>

    <!-- dialog delete  -->
    <Dialog
      v-model:visible="deleteCausaDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="causa"
          >¿Estás segura de que quieres eliminar <b>{{ causa.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteCausaDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteCausa" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteCausasDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="causa">¿Estás seguro de que deseas eliminar las Causas seleccionadas?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteCausasDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteSelectedCausas"
        />
      </template>
    </Dialog>
    <!-- Dialog cambio estado causa -->
    <Dialog
      v-model:visible="cambioEstadoDialog"
      :style="{ width: '550px' }"
      header="Terminar Causa"
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
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveEstadoCausa" />
      </template>
    </Dialog>
  </div>
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
  margin-top: 1rem;
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

.badge {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  padding: 0.3em 0.6em;
  font-size: 0.8em;
  margin-left: 0.5em;
  display: inline-block;
  min-width: 20px;
  text-align: center;
}
.menu-item {
  margin-right: 5px;
  margin-left: 5px;
  cursor: pointer;
}

/* Estilo opcional para espaciado entre botones */
.mr-2 {
  margin-right: 0.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}

.custom-div {
  padding: 5px;
}

.dropdown-spacing {
  margin-right: 1rem;
}

.dropdown-spacing:last-child {
  margin-right: 0; /* Sin margen en el último elemento */
}
/*Estilos para el bloqueo del formulario y loading */
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
