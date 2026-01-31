<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { TableSize, getTipoSeverityTrn } from '@/constants/constants'
import type { IProcuradorPago } from '../types/procuradorPago.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import procuradorPagoService from '../services/procuradorPago.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const dt = ref()

const DetallePagoDialog = ref(false)
const detallePago = ref<IProcuradorPago>()

const procuradorPagos = ref<IProcuradorPago[]>([])

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

const loadProcuradorPagos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['fecha_pago', 'monto', 'glosa'],
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

  const response = await procuradorPagoService.getProcuradorPagos(opciones)

  procuradorPagos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadProcuradorPagos()
})
watch(
  () => filters.value.global.value,
  () => {
    loadProcuradorPagos()
  }
)

const hideDialog = () => {
  submitted.value = false
  DetallePagoDialog.value = false
}

const verDetalleTransaccion = async (detpago: IProcuradorPago) => {
  DetallePagoDialog.value = true
  detallePago.value = { ...detpago }
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />

        <DataTable
          ref="dt"
          :value="procuradorPagos"
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
          @page="loadProcuradorPagos"
          @sort="loadProcuradorPagos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Pagos a Procuradores</h4>
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

          <Column field="fecha_pago" header="Fecha Pago" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha</span>
              {{ slotProps.data.fecha_pago }}
            </template></Column
          >
          <Column field="fecha_inicio_consulta" header="Fecha inicio de consulta" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha</span>
              {{ slotProps.data.fecha_inicio_consulta }}
            </template></Column
          >
          <Column field="fecha_fin_consulta" header="Fecha fin pago" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha</span>
              {{ slotProps.data.fecha_fin_consulta }}
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
    v-model:visible="DetallePagoDialog"
    :style="{ width: '450px' }"
    header="Detalle de pago"
    :modal="true"
    class="p-fluid"
  >
    <div class="p-grid p-dir-col">
      <div class="field p-mb-3">
        <label class="p-text-bold" for="monto">Monto <i class="pi pi-money-bill p-mr-2"></i></label>
        <div class="field-value">
          {{ detallePago?.monto }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="fecha"
          >Fecha de pago <i class="pi pi-calendar p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detallePago?.fecha_pago }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="tipo"
          >Fecha inicio de consulta <i class="pi pi-tag p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detallePago?.fecha_inicio_consulta }}
        </div>
      </div>
      <div class="field p-mb-3">
        <label class="p-text-bold" for="tipo"
          >Fecha fin de consulta <i class="pi pi-tag p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detallePago?.fecha_fin_consulta }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="glosa"
          >Glosa <i class="pi pi-info-circle p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detallePago?.glosa }}
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
