<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { TableSize } from '@/constants/constants'
import type { IRetiro } from '../types/retiro.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import retiroService from '../services/retiro.service'
import type { ITablaConfig } from '../../TablaConfig/types/tablaConfig.types'
import tablaConfigService from '../../TablaConfig/services/tablaConfig.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const dt = ref()
const dtCausas = ref()

const retiroDialog = ref(false)
const transaccionesCausaDialog = ref(false)
const transaccionesDevolucionCausaDialog = ref(false)
const loadingButtonSave = ref(false)
const DetalleRetiroDialog = ref(false)
const tablaConfigSelected = ref<ITablaConfig>()
const detalleRetiro = ref<IRetiro>()

const retiros = ref<IRetiro[]>([])
const retiro = ref<IRetiro>({
  id: 0,
  monto: 0,
  glosa: ''
} as IRetiro)

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

const loadRetiros = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['fecha_retiro', 'monto', 'glosa'],
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

  const response = await retiroService.getRetiros(opciones)

  retiros.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadRetiros()
})
watch(
  () => filters.value.global.value,
  () => {
    loadRetiros()
  }
)

const openNew = () => {
  retiro.value = {} as IRetiro
  submitted.value = false
  retiroDialog.value = true
}

const hideDialog = () => {
  retiroDialog.value = false
  submitted.value = false
  transaccionesCausaDialog.value = false
  transaccionesDevolucionCausaDialog.value = false
  DetalleRetiroDialog.value = false
}

const saveTransaccion = async () => {
  submitted.value = true
  if (!retiro.value?.monto) return
  loadingButtonSave.value = true
  try {
    if (retiro.value?.monto) {
      await retiroService.createRetiro(retiro.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Transaccion  registrada',
        life: 3000
      })
    }
    hideDialog()
    loadRetiros()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al hacer el retiro.',
      life: 5000
    })
  } finally {
    submitted.value = false
    loadingButtonSave.value = false
  }
}

const verDetalleTransaccion = async (detTrnRetiro: IRetiro) => {
  DetalleRetiroDialog.value = true
  detalleRetiro.value = { ...detTrnRetiro }
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
                label="Registrar Retiro"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="retiros"
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
          @page="loadRetiros"
          @sort="loadRetiros"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Retiros</h4>
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
          <Column field="fecha_retiro" header="Fecha retiro" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha retiro</span>
              {{ slotProps.data.fecha_retiro }}
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
    v-model:visible="DetalleRetiroDialog"
    :style="{ width: '450px' }"
    header="Detalle de Retiro"
    :modal="true"
    class="p-fluid"
  >
    <div class="p-grid p-dir-col">
      <div class="field p-mb-3">
        <label class="p-text-bold" for="monto">Monto <i class="pi pi-money-bill p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleRetiro?.monto }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="fecha"
          >Fecha Retiro<i class="pi pi-calendar p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleRetiro?.fecha_retiro }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="glosa"
          >Glosa <i class="pi pi-info-circle p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleRetiro?.glosa }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Ok" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
    </template>
  </Dialog>

  <!-- deposito contador modal -->
  <Dialog
    v-model:visible="retiroDialog"
    :style="{ width: '450px' }"
    header="Retiro"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="nombre">Monto</label>
      <InputNumber
        id="monto"
        v-model="retiro.monto"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && !retiro.monto === null"
      />
      <small class="p-error" v-if="submitted && !retiro.monto">Monto es requerido.</small>
    </div>
    <div class="field">
      <label for="glosa">Glosa</label>
      <Textarea
        v-model="retiro.glosa"
        rows="5"
        cols="30"
        required="true"
        :invalid="submitted && !retiro.glosa"
      />
      <small class="p-error" v-if="submitted && !retiro.glosa">Glosa es requerido.</small>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveTransaccion"
        :disabled="loadingButtonSave"
        :loading="loadingButtonSave"
      />
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
