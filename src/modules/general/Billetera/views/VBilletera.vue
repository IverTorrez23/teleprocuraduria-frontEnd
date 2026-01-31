<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { EstadosCausas, TableSize, getTipoSeverityTrn } from '@/constants/constants'
import type { IBilletera } from '../types/billetera.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import billeteraService from '../services/billetera.service'
import type { IBilleteraTransaccion } from '../../BilleteraTransaccion/types/billeteraTransaccion.types'
import billeteraTransaccionService from '../../BilleteraTransaccion/services/billeteraTransaccion.service'
import causaService from '../../Causas/services/causa.service'
import type { ICausa } from '../../Causas/types/causa.types'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import type { ITransaccionesCausa } from '../../TransaccionesCausas/types/transaccionesCausas.types'
import transaccionesCausasService from '../../TransaccionesCausas/services/transaccionesCausas.service'
import type { ICausaBilletera } from '../types/causaBilletera.types'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
//import VFiltroTransaccionesFechas from 'VFiltroTransaccionesFechas.vue'
import VFiltroTransaccionesFechas from './VFiltroTransaccionesFechas.vue'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const dt = ref()
const dtCausas = ref()
const causasBilletera = ref<ICausaBilletera[]>([])
const billetera = ref<IBilletera>()
const billeteraTransacciones = ref<IBilleteraTransaccion[]>([])
interface ICausaConCodigo extends ICausa {
  codigoCausa: string
}
const causaOrigin = ref<ICausaConCodigo[]>([])
const causaDestino = ref<ICausaConCodigo[]>([])
const transaccionDialog = ref(false)
const isVisibleCausaOrigenForm = ref(true)
const transaccionesCausaDialog = ref(false)
const transaccionesDevolucionCausaDialog = ref(false)
const disabledButtonSavetransaccion = ref(false)
const DetalleTransBillIndividualDialog = ref(false)
const detalleTransBilletera = ref<IBilleteraTransaccion>()
const billeteratransaccion = ref<IBilleteraTransaccion>({
  id: 0,
  monto: 0,
  billetera_id: 0
} as IBilleteraTransaccion)

const transaccionesCausa = ref<ITransaccionesCausa>({
  id: 0,
  monto: 0,
  causa_id: 0,
  causa_origen_destino: 0,
  desde_billetera: 0
} as ITransaccionesCausa)

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

const saldoDisponibleGral = ref(0)
const saldoComprometidoGral = ref(0)
const loadBilletera = async () => {
  const response = await billeteraService.obtenerPorAbogadoId(
    usuario.value?.id ? usuario.value?.id : 0
  )
  if (response) {
    billetera.value = response
    await loadTransaccionesBilletera()
    await loadDineroComprometidoGeneral()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener billetera',
      life: 3000
    })
  }
}
const fechaIni = ref('')
const fechaFin = ref('')
fechaIni.value = dayjs().format('YYYY-MM-DD')
fechaFin.value = dayjs().format('YYYY-MM-DD')

const loadTransaccionesBilletera = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['monto', 'tipo', 'glosa'],
          keyword: filters.value.global.value
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

  const response = await billeteraTransaccionService.getTransaccionesBilletera(
    opciones,
    fechaIni.value,
    fechaFin.value,
    billetera.value?.id ? billetera.value?.id : 0
  )

  billeteraTransacciones.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadCausasConBilleteras = async () => {
  const response = await causaService.listarCausasConBilleteraPorUsuario()

  if (response) {
    // Recorrer causas y agregar el dinero comprometido
    const causasConDinero = await Promise.all(
      response.map(async (causa) => {
        const total = await causaService.obtenerDineroComprometidoDeCausa(causa.id)
        const dineroComprometido = total ?? 0
        const saldoReal = (causa.billetera ?? 0) - dineroComprometido
        return {
          ...causa,
          dinero_comprometido: total ?? 0,
          saldo_real: saldoReal
        }
      })
    )

    causasBilletera.value = causasConDinero
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener causas',
      life: 3000
    })
  }
}

/*const loadCausasOrigenTransaccion = async () => {
  const result = await causaService.listadoOrigenTransaccion()

  if (result.data) {
    causaOrigin.value =
      result.data?.map((causa) => ({
        ...causa,
        codigoCausa: `${causa.materia?.abreviatura || ''}-${causa.tipo_legal?.abreviatura || ''}-${causa.id || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las causas.',
      life: 3000
    })
  }
}*/
const loadCausasOrigenTransaccion = async () => {
  const result = await causaService.listadoOrigenTransaccion()

  if (result.data) {
    const causasMapeadas: ICausaConCodigo[] =
      result.data.map((causa) => ({
        ...causa,
        codigoCausa: `${causa.materia?.abreviatura || ''}-${causa.tipo_legal?.abreviatura || ''}-${causa.id || ''}`
      })) || []

    causaOrigin.value = [
      {
        codigoCausa: 'Billetera general',
        id: -1,
        nombre: 'Billetera general',
        // rellena los demás campos obligatorios de ICausa:
        observacion: '',
        objetivos: '',
        estrategia: '',
        informacion: '',
        apuntes_juridicos: '',
        apuntes_honorarios: '',
        tiene_billetera: 0,
        billetera: 0,
        saldo_devuelto: 0,
        color: 'string',
        materia_id: 0,
        tipolegal_id: 0,
        categoria_id: 0,
        abogado_id: 0,
        procurador_id: 0,
        usuario_id: 0,
        plantilla_id: 0,
        estado: 'string',
        motivo_congelada: 'string',
        es_eliminado: 0,
        created_at: 'string',
        updated_at: ''
        // ... lo que pida tu ICausa
      },
      ...causasMapeadas
    ]
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las causas.',
      life: 3000
    })
  }
}

const loadCausasDestinoTransaccion = async () => {
  const result = await causaService.listadoDestinoTransaccion()

  if (result.data) {
    /*causaDestino.value =
      result.data?.map((causa) => ({
        ...causa,
        codigoCausa: `${causa.materia?.abreviatura || ''}-${causa.tipo_legal?.abreviatura || ''}-${causa.id || ''}`
      })) || []*/

    const causasMapeadas: ICausaConCodigo[] =
      result.data.map((causa) => ({
        ...causa,
        codigoCausa: `${causa.materia?.abreviatura || ''}-${causa.tipo_legal?.abreviatura || ''}-${causa.id || ''}`
      })) || []

    causaDestino.value = [
      {
        codigoCausa: 'Billetera general',
        id: -1,
        nombre: 'Billetera general',
        // rellena los demás campos obligatorios de ICausa:
        observacion: '',
        objetivos: '',
        estrategia: '',
        informacion: '',
        apuntes_juridicos: '',
        apuntes_honorarios: '',
        tiene_billetera: 0,
        billetera: 0,
        saldo_devuelto: 0,
        color: 'string',
        materia_id: 0,
        tipolegal_id: 0,
        categoria_id: 0,
        abogado_id: 0,
        procurador_id: 0,
        usuario_id: 0,
        plantilla_id: 0,
        estado: 'string',
        motivo_congelada: 'string',
        es_eliminado: 0,
        created_at: 'string',
        updated_at: ''
        // ... lo que pida tu ICausa
      },
      ...causasMapeadas
    ]
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las causas.',
      life: 3000
    })
  }
}

const loadDineroComprometidoGeneral = async () => {
  const response = await causaService.obtenerDineroComprometidoGeneral()

  if (response != null) {
    saldoComprometidoGral.value = response
    saldoDisponibleGral.value = (billetera.value?.monto ?? 0) - saldoComprometidoGral.value
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener Dinero comprometido',
      life: 3000
    })
  }
}

onMounted(() => {
  loadBilletera()
  loadCausasConBilleteras()
  loadCausasOrigenTransaccion()
  loadCausasDestinoTransaccion()
})
watch(
  () => filters.value.global.value,
  () => {
    loadTransaccionesBilletera()
    //loadCausasConBilleteras()
  }
)

const saveTransaccionCausa = async () => {
  submitted.value = true

  if (!transaccionesCausa.value?.causa_id || transaccionesCausa.value?.monto < 1) return

  try {
    if (
      transaccionesCausa.value.causa_id == -1 &&
      transaccionesCausa.value.causa_origen_destino > 0
    ) {
      disabledButtonSavetransaccion.value = true
      await transaccionesCausasService.createDevolucionABilleteraGeneral(transaccionesCausa.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Teansacción Existosa',
        life: 2000
      })
    } else {
      disabledButtonSavetransaccion.value = true
      if (transaccionesCausa.value.causa_origen_destino == -1) {
        transaccionesCausa.value.desde_billetera = 1
      }
      await transaccionesCausasService.createTransaccionCausa(transaccionesCausa.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Teansacción Existosa',
        life: 2000
      })
    }

    hideDialog()
    loadBilletera()
    loadCausasConBilleteras()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 10000 })
  } finally {
    disabledButtonSavetransaccion.value = false
  }
}
const saveTransaccionDevolucionABGral = async () => {
  submitted.value = true

  if (!transaccionesCausa.value?.causa_origen_destino || transaccionesCausa.value?.monto < 1) return

  try {
    disabledButtonSavetransaccion.value = true
    await transaccionesCausasService.createDevolucionABilleteraGeneral(transaccionesCausa.value)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Teansacción Existosa',
      life: 2000
    })
    hideDialog()
    loadBilletera()
    loadCausasConBilleteras()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 10000 })
  } finally {
    disabledButtonSavetransaccion.value = false
  }
}
const openNew = () => {
  billeteratransaccion.value = {} as IBilleteraTransaccion
  submitted.value = false
  transaccionDialog.value = true
}

const openNewTransaccionCausa = () => {
  transaccionesCausa.value = {} as ITransaccionesCausa
  transaccionesCausa.value.monto = 0
  transaccionesCausa.value.desde_billetera = 0
  disabledButtonSavetransaccion.value = false
  isVisibleCausaOrigenForm.value = true
  submitted.value = false
  transaccionesCausaDialog.value = true
}

const openNewDevolucionTransaccionCausa = () => {
  transaccionesCausa.value = {} as ITransaccionesCausa
  transaccionesCausa.value.monto = 0

  disabledButtonSavetransaccion.value = false
  transaccionesDevolucionCausaDialog.value = true
  submitted.value = false
}

const hideDialog = () => {
  transaccionDialog.value = false
  submitted.value = false
  transaccionesCausaDialog.value = false
  transaccionesDevolucionCausaDialog.value = false
  DetalleTransBillIndividualDialog.value = false
}

const saveTransaccion = async () => {
  submitted.value = true
  billeteratransaccion.value.billetera_id = billetera.value?.id ? billetera.value?.id : 0
  if (!billeteratransaccion.value?.monto || !billeteratransaccion.value?.billetera_id) return

  try {
    if (billeteratransaccion.value.billetera_id) {
      await billeteraTransaccionService.createTransaccion(billeteratransaccion.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Transaccion  registrada',
        life: 3000
      })
    }
    hideDialog()
    loadBilletera()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save transacción',
      life: 3000
    })
  }
  submitted.value = false
}

const modalTexCompletoVisible = ref(false)
const fullText = ref('')
const headerTextoCompleto = ref('')

const onCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    transaccionesCausa.value.desde_billetera = 1
    isVisibleCausaOrigenForm.value = false
  } else {
    transaccionesCausa.value.desde_billetera = 0
    isVisibleCausaOrigenForm.value = true
  }
}
const verDetalleTransaccion = async (detTrnBill: IBilleteraTransaccion) => {
  DetalleTransBillIndividualDialog.value = true
  detalleTransBilletera.value = { ...detTrnBill }
}
type Range = { from: Date; to: Date }

const rango = ref<Range | null>(null)

function cargarTransacciones(e: { range: Range; formatted?: { from: string; to: string } }) {
  // Llama a tu servicio con e.formatted?.from / to o con e.range (Date)
  // Ejemplo:
  // await billeteraService.listar({ desde: e.formatted?.from, hasta: e.formatted?.to })
  console.log('Rango aplicado:', e)
}
const transacciones = ref<any[]>([
  // tus datos aquí
])
const transaccionesFiltradas = ref<any[]>([...transacciones.value])
const filtrarTransacciones = async ({ desde, hasta }: { desde: Date; hasta: Date }) => {
  const fechaInicioComp = dayjs(desde).format('YYYY-MM-DD')
  const fechaFinComp = dayjs(hasta).format('YYYY-MM-DD')

  console.log('fecha inicio:', fechaInicioComp)
  console.log('fecha fin:', fechaFinComp)
  fechaIni.value = fechaInicioComp
  fechaFin.value = fechaFinComp
  loadTransaccionesBilletera()
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <Toolbar class="mb-4">
          <template #start>
            <div class="my-2">
              <Button
                label="Depositar"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>

          <template #end>
            <label>Saldo total: Bs.<Tag :value="billetera?.monto" severity="warning" /></label>|
            <label
              >Saldo comprometido: Bs.<Tag
                :value="`${saldoComprometidoGral.toFixed(2)}`"
                severity="danger"
              /> </label
            >|
            <label
              >Saldo disponible: Bs.<Tag
                :value="`${saldoDisponibleGral.toFixed(2)}`"
                severity="success"
            /></label>
          </template>
        </Toolbar>
        <!-- <VFiltroTransaccionesFechas
    v-model="rango"
    format="YYYY-MM-DD HH:mm:ss"
    @apply="cargarTransacciones"
  /> -->
        <VFiltroTransaccionesFechas @filtrar="filtrarTransacciones" />
        <DataTable
          ref="dt"
          :value="billeteraTransacciones"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} transacciones"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          @page="loadTransaccionesBilletera"
          @sort="loadTransaccionesBilletera"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Transacciones de Billetera General</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>
          <template #empty> No se encontraron registros. </template>
          <template #loading> Cargando los registros... </template>

          <Column field="id" header="Info">
            <template #body="slotProps">
              <span class="p-column-title">Info</span>

              <Button
                style="width: 30px; height: 30px"
                v-tooltip.bottom="'Información'"
                icon="pi pi-info-circle"
                class="p-button-rounded p-button-info mr-2"
                @click="verDetalleTransaccion(slotProps.data)"
              /> </template
          ></Column>
          <Column field="monto" header="Monto" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Monto</span>
              {{ slotProps.data.monto }}
            </template></Column
          >
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              <Tag
                :value="slotProps.data.tipo"
                :severity="getTipoSeverityTrn(slotProps.data.tipo)"
              />
            </template>
          </Column>
          <Column field="fecha_transaccion" header="Fecha Transacción" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha</span>
              {{ slotProps.data.fecha_transaccion }}
            </template></Column
          >

          <Column field="glosa" header="Glosa" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Glosa</span>
              {{ slotProps.data.glosa }}
            </template></Column
          >
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="transaccionDialog"
          :style="{ width: '450px' }"
          header="Transacción"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Monto</label>
            <InputNumber
              id="monto"
              v-model="billeteratransaccion.monto"
              mode="currency"
              currency="BOB"
              locale="es-BO"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              :invalid="submitted && !billeteratransaccion.monto === null"
            />
            <small class="p-error" v-if="submitted && !billeteratransaccion.monto"
              >Monto es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveTransaccion"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>

  <div class="card p-3">
    <Toolbar class="mb-4">
      <template #start>
        <div class="my-2">
          <Button
            label="Transferir"
            icon="pi pi-plus"
            class="p-button-success mr-2"
            @click="openNewTransaccionCausa"
          />
          <!-- <Button
            label="Devolución"
            icon="pi pi-replay"
            class="p-button-success mr-2"
            @click="openNewDevolucionTransaccionCausa"
          /> -->
        </div>
      </template>
    </Toolbar>

    <DataTable
      ref="dtCausas"
      :value="causasBilletera"
      dataKey="id"
      resizableColumns
      columnResizeMode="fit"
      showGridlines
      :size="TableSize.small"
      tableStyle="min-width: 50rem"
    >
      <h4 class="m-1">Causas con Billetera</h4>

      <template #empty> No se encontraron registros. </template>
      <template #loading> Cargando los registros... </template>
      <Column field="codigo" header="Código" sortable style="min-width: 9rem">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.materia.abreviatura}-${slotProps.data.tipo_legal.abreviatura}-${slotProps.data.id}`"
            link
            @click="
              $router.push({
                name: 'TransaccionesDeCausa',
                params: { idCausa: slotProps.data.id }
              })
            "
          />
        </template>
      </Column>

      <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>

      <Column field="primer_demandante" header="Demandante" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data?.primer_demandante?.nombres }}
        </template></Column
      >
      <Column field="primer_demandado" header="Demandado" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data?.primer_demandado?.nombres }}
        </template></Column
      >
      <Column field="primer_tribunal" header="Juzgado" style="min-width: 8rem">
        <template #body="slotProps">
          <span v-if="slotProps.data?.primer_tribunal?.juzgado">
            {{ slotProps.data?.primer_tribunal?.juzgado?.nombre_numerico }}°
            {{ slotProps.data?.primer_tribunal?.juzgado?.jerarquia }}
            {{ slotProps.data?.primer_tribunal?.juzgado?.materia_juzgado }}
            {{ slotProps.data?.primer_tribunal?.juzgado?.distrito?.abreviatura }}
          </span>
        </template></Column
      >

      <Column field="billetera" header="Saldo total" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.billetera }}
        </template></Column
      >
      <Column field="dinero_comprometido" header="Monto comprometido" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.dinero_comprometido }}
        </template></Column
      >
      <Column field="saldo_real" header="Saldo disponible" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.saldo_real }}
        </template></Column
      >

      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag :value="slotProps.data.estado" :severity="getEstado(slotProps.data.estado)" /><small
            v-if="slotProps.data.estado === EstadosCausas.BLOQUEADA"
            style="font-size: 0.75rem; color: black"
          >
            {{ slotProps.data.motivo_congelada }}</small
          >
        </template></Column
      >
    </DataTable>
  </div>

  <OVisorTextCompleto
    :fullText="fullText"
    :visible="modalTexCompletoVisible"
    @update:visible="modalTexCompletoVisible = $event"
    :header="headerTextoCompleto"
  />

  <!-- create and edit modal -->
  <Dialog
    v-model:visible="transaccionesCausaDialog"
    :style="{ width: '550px' }"
    header="TRANSFERENCIAS INTERNAS"
    :modal="true"
    class="p-fluid"
  >
    <!-- <div class="field">
      <label for="desde_billetera">Transferencia desde Billetera General? </label>
      <div class="flex items-center" style="width: 60%">
        <Checkbox
          v-model="transaccionesCausa.desde_billetera"
          :true-value="1"
          :false-value="0"
          indeterminate
          binary
          @change="onCheckboxChange"
        />
        &nbsp;
        <Tag value="Se transfiere desde mi billetera general" severity="info" />
      </div>
    </div> -->

    <div class="field" v-if="isVisibleCausaOrigenForm">
      <label for="causa_origen_destino">Origen</label>
      <Dropdown
        id="causa_origen_destino"
        v-model="transaccionesCausa.causa_origen_destino"
        :options="causaOrigin"
        optionLabel="codigoCausa"
        optionValue="id"
        filter
        filterPlaceholder="Buscar Causa"
        :invalid="submitted && !transaccionesCausa.causa_origen_destino"
      />
      <small class="p-error" v-if="submitted && !transaccionesCausa.causa_origen_destino"
        >Origen es requerido.</small
      >
    </div>

    <div class="field">
      <label for="causa_id">Destino</label>
      <Dropdown
        id="causa_id"
        v-model="transaccionesCausa.causa_id"
        :options="causaDestino"
        optionLabel="codigoCausa"
        optionValue="id"
        filter
        filterPlaceholder="Buscar Causa"
        :invalid="submitted && !transaccionesCausa.causa_id"
      />
      <small class="p-error" v-if="submitted && !transaccionesCausa.causa_id"
        >Destino es requerido.</small
      >
    </div>

    <div class="field">
      <label for="nombre">Monto</label>
      <InputNumber
        id="monto"
        v-model="transaccionesCausa.monto"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && !transaccionesCausa.monto === null"
      />
      <small class="p-error" v-if="submitted && !transaccionesCausa.monto"
        >Monto es requerido.</small
      >
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        :disabled="disabledButtonSavetransaccion"
        @click="saveTransaccionCausa"
      />
    </template>
  </Dialog>
  <!-- create and edit modal devolucion de causa a billetera general-->
  <Dialog
    v-model:visible="transaccionesDevolucionCausaDialog"
    :style="{ width: '550px' }"
    header="Devolución a Billetera General"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="causa_origen_destino">Causa</label>
      <Dropdown
        id="causa_origen_destino"
        v-model="transaccionesCausa.causa_origen_destino"
        :options="causaOrigin"
        optionLabel="codigoCausa"
        optionValue="id"
        filter
        filterPlaceholder="Buscar Causa"
        :invalid="submitted && !transaccionesCausa.causa_origen_destino"
      />
      <small class="p-error" v-if="submitted && !transaccionesCausa.causa_origen_destino"
        >Causa origen es requerido.</small
      >
    </div>

    <div class="field">
      <label for="nombre">Monto</label>
      <InputNumber
        id="monto"
        v-model="transaccionesCausa.monto"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && !transaccionesCausa.monto === null"
      />
      <small class="p-error" v-if="submitted && !transaccionesCausa.monto"
        >Monto es requerido.</small
      >
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        :disabled="disabledButtonSavetransaccion"
        @click="saveTransaccionDevolucionABGral"
      />
    </template>
  </Dialog>
  <!-- Detalle de transaccion billetera personal -->
  <Dialog
    v-model:visible="DetalleTransBillIndividualDialog"
    :style="{ width: '450px' }"
    header="Detalle de Transacción"
    :modal="true"
    class="p-fluid"
  >
    <div class="p-grid p-dir-col">
      <div class="field p-mb-3">
        <label class="p-text-bold" for="monto">Monto <i class="pi pi-money-bill p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransBilletera?.monto }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="fecha">Fecha <i class="pi pi-calendar p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransBilletera?.fecha_transaccion }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="tipo">Tipo <i class="pi pi-tag p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransBilletera?.tipo }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="glosa"
          >Glosa <i class="pi pi-info-circle p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleTransBilletera?.glosa }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Ok" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
    </template>
  </Dialog>
</template>
<style scoped lang="scss">
.field-value {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: var(--text-color, #333);
  margin-top: -0.5rem;
}

.p-text-bold {
  font-weight: bold;
}

.p-mb-3 {
  margin-bottom: 0.6rem;
}
</style>
