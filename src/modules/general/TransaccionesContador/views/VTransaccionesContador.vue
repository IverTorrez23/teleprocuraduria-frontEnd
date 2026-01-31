<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { TableSize, getTipoSeverityTrn } from '@/constants/constants'
import type { ITransaccionesContador } from '../types/transaccionesContador.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import transaccionesContadorService from '../services/transaccionesContador.service'
import type { ITablaConfig } from '@/modules/admin/TablaConfig/types/tablaConfig.types'
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const dt = ref()
const dtCausas = ref()

const trnDepositoContadorDialog = ref(false)
const isVisibleCausaOrigenForm = ref(true)
const transaccionesCausaDialog = ref(false)
const transaccionesDevolucionCausaDialog = ref(false)
const disabledButtonSavetransaccion = ref(false)
const DetalleTransAdminDialog = ref(false)
const tablaConfigSelected = ref<ITablaConfig>()
const detalleTransAdmin = ref<ITransaccionesContador>()

const transaccionesContador = ref<ITransaccionesContador[]>([])
const transaccionContador = ref<ITransaccionesContador>({
  id: 0,
  monto: 0
} as ITransaccionesContador)

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

const loadTransaccionesContador = async (event?: DataTableSortEvent) => {
  try {
    const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
    const perPage = event ? event.rows : pagination.value.rowsPerPage
    const search: ISearch[] = filters.value.global.value
      ? [
          {
            fields: ['fecha_transaccion', 'monto', 'tipo', 'glosa'],
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

    const response = await transaccionesContadorService.getTransaccionesContador(opciones)

    transaccionesContador.value = response.result
    pagination.value.rowsNumber = response.pagination.rowsNumber
    pagination.value.totalItems = response.pagination.totalItems
    pagination.value.itemCount = response.pagination.itemCount
    pagination.value.rowsPerPage = response.pagination.rowsPerPage
    pagination.value.currentPage = response.pagination.currentPage

    loadDatosTablaConfig()
  } catch (error) {
    console.error('Error al cargar las transacciones:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las transacciones.',
      life: 3000
    })
  }
}
const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    tablaConfigSelected.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDatosTablaConfig()
  loadTransaccionesContador()
})
watch(
  () => filters.value.global.value,
  () => {
    loadTransaccionesContador()
  }
)

const openNew = () => {
  transaccionContador.value = {} as ITransaccionesContador
  submitted.value = false
  trnDepositoContadorDialog.value = true
}

const hideDialog = () => {
  trnDepositoContadorDialog.value = false
  submitted.value = false
  transaccionesCausaDialog.value = false
  transaccionesDevolucionCausaDialog.value = false
  DetalleTransAdminDialog.value = false
}

const saveDevolucionAdmin = async () => {
  submitted.value = true
  if (!transaccionContador.value?.monto) return

  try {
    if (transaccionContador.value?.monto) {
      await transaccionesContadorService.transaccionDevolicionAdmin(transaccionContador.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Transaccion  registrada',
        life: 3000
      })
    }
    hideDialog()
    loadTransaccionesContador()
  } catch (error: any) {
    console.log('error', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al depositar al contador.',
      life: 5000
    })
  } finally {
    submitted.value = false
  }
}
const verDetalleTransaccion = async (detTrnAdmin: ITransaccionesContador) => {
  DetalleTransAdminDialog.value = true
  detalleTransAdmin.value = { ...detTrnAdmin }
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
                label="Devolver al Administrador"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>

          <template #end>
            <label
              >Saldo disponible: Bs.<Tag
                :value="tablaConfigSelected?.caja_contador"
                severity="success"
            /></label>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="transaccionesContador"
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
          @page="loadTransaccionesContador"
          @sort="loadTransaccionesContador"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Transacciones en la caja del contador</h4>
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
      </div>
    </div>
  </div>

  <!-- Detalle de transaccion -->
  <Dialog
    v-model:visible="DetalleTransAdminDialog"
    :style="{ width: '450px' }"
    header="Detalle de Transacción"
    :modal="true"
    class="p-fluid"
  >
    <div class="p-grid p-dir-col">
      <div class="field p-mb-3">
        <label class="p-text-bold" for="monto">Monto <i class="pi pi-money-bill p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransAdmin?.monto }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="fecha">Fecha <i class="pi pi-calendar p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransAdmin?.fecha_transaccion }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="tipo">Tipo <i class="pi pi-tag p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleTransAdmin?.tipo }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="glosa"
          >Glosa <i class="pi pi-info-circle p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleTransAdmin?.glosa }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Ok" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
    </template>
  </Dialog>

  <!-- deposito  modal -->
  <Dialog
    v-model:visible="trnDepositoContadorDialog"
    :style="{ width: '450px' }"
    header="Transacción"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="nombre">Monto</label>
      <InputNumber
        id="monto"
        v-model="transaccionContador.monto"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && !transaccionContador.monto === null"
      />
      <small class="p-error" v-if="submitted && !transaccionContador.monto"
        >Monto es requerido.</small
      >
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDevolucionAdmin" />
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
