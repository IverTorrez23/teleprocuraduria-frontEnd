<script setup lang="ts">
import type { IOrden } from '@/modules/general/Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import { FilterMatchMode } from 'primevue/api'
import { TableSize } from '@/constants/constants'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import ordenService from '@/modules/general/Ordenes/services/orden.service'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import { CalificacionesOrden } from '@/constants/constants'
import procuradorPagoService from '../services/procuradorPago.service'
import type { IProcuradorPago } from '../types/procuradorPago.types'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()
const selectedProcurador = ref(usuario.value?.id ? usuario.value?.id : 0)
const fechaInicioConsulta = ref('')
const fechaFinConsulta = ref('')
const ordenes = ref<IOrden[]>([])
const submitted = ref(false)

const btnConsultarLoading = ref(false)
const DetallePagoDialog = ref(false)
const detallePago = ref<IProcuradorPago>()

const totalMontoPagar = ref(0)

const procuradorPagos = ref<IProcuradorPago[]>([])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const pagination = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})

const loadOrdenesParaPagoAProcurador = async (id: number) => {
  const response = await ordenService.listarParaPagoAProcurador(
    id,
    fechaInicioConsulta.value,
    fechaFinConsulta.value
  )
  if (response) {
    const ordenesCalculadas = response.map((orden) => {
      const monto =
        orden.calificacion === CalificacionesOrden.SUFICIENTE
          ? orden.cotizacion.compra
          : orden.cotizacion.penalizacion

      return {
        ...orden,
        monto_pagar: monto
      }
    })

    ordenes.value = ordenesCalculadas
    totalMontoPagar.value = ordenes.value.reduce(
      (sum, orden) => sum + parseFloat((orden as any).monto_pagar || '0'),
      0
    )
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener ordenes del procurador o no tiene ordenes',
      life: 4000
    })
  }
}

const loadProcuradorPagosDeProc = async (event?: DataTableSortEvent) => {
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

  const response = await procuradorPagoService.getProcuradorPagosDeProc(
    opciones,
    usuario.value?.id ? usuario.value?.id : 0
  )

  procuradorPagos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}
onMounted(() => {
  loadProcuradorPagosDeProc()
})

const checkedRowsSelected = ref<IOrden[]>([])
const obtenerListadoOrden = async (procuradorId: number) => {
  submitted.value = true
  if (fechaInicioConsulta.value === '' || fechaFinConsulta.value === '') return
  btnConsultarLoading.value = true
  try {
    await resetValoresDeTabla()
    await loadOrdenesParaPagoAProcurador(procuradorId)
  } finally {
    submitted.value = false
    btnConsultarLoading.value = false
  }
}
const resetValoresDeTabla = async () => {
  checkedRowsSelected.value = []
  ordenes.value = []
}

const hideDialog = () => {
  DetallePagoDialog.value = false
}
const verDetalleTransaccion = async (detpago: IProcuradorPago) => {
  DetallePagoDialog.value = true
  detallePago.value = { ...detpago }
}
</script>

<template>
  <div class="card p-3">
    <div class="col-12">
      <Toast />
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-3">
          <label for="fecha_inicio" class="block mb-2">Fecha Inicio Consulta</label>
          <Calendar
            id="fecha_inicio"
            :modelValue="fechaInicioConsulta ? new Date(fechaInicioConsulta) : null"
            @update:modelValue="
              (date) => (fechaInicioConsulta = date ? formatearFechaHora(date) : '')
            "
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
            :invalid="submitted && !fechaInicioConsulta"
          />
          <small class="p-error" v-if="submitted && !fechaInicioConsulta"
            >Seleccione fecha inicio.</small
          >
        </div>
        <div class="field col-12 md:col-3">
          <label for="fecha_fin" class="block mb-2">Fecha Fin Consulta</label>
          <Calendar
            id="fecha_fin"
            :modelValue="fechaFinConsulta ? new Date(fechaFinConsulta) : null"
            @update:modelValue="(date) => (fechaFinConsulta = date ? formatearFechaHora(date) : '')"
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
            :invalid="submitted && !fechaFinConsulta"
          />
          <small class="p-error" v-if="submitted && !fechaFinConsulta">Seleccione fecha fin.</small>
        </div>
        <Divider />
        <div class="field col-12 md:col-3 mt-1">
          <Button
            :label="btnConsultarLoading ? 'Consultando...' : 'Consultar'"
            :icon="btnConsultarLoading ? 'pi pi-spinner pi-spin' : 'pi pi-search'"
            :disabled="btnConsultarLoading"
            severity="success"
            class="mr-2"
            @click="obtenerListadoOrden(selectedProcurador)"
          />
        </div>

        <Divider />
        <div class="field col-12">
          <DataTable
            ref="dtentrega"
            dataKey="id"
            :value="ordenes"
            columnResizeMode="fit"
            showGridlines
            :size="TableSize.small"
            tableStyle="width: 100%"
          >
            <Column field="codigo" header="Codigo Causa" style="width: 7%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.causa?.materia?.abreviatura }}-{{
                  slotPropsOrden.data?.causa?.tipo_legal?.abreviatura
                }}-{{ slotPropsOrden.data?.causa?.id }}
              </template></Column
            >

            <Column field="id" header="Número Orden" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.id }}
              </template></Column
            >

            <Column field="prioridad" header="Prioridad" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.prioridad }}
              </template></Column
            >

            <Column field="cotizacion.condicion" header="Plazo de orden" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ plazoSegunCondicion(slotPropsOrden.data.cotizacion.condicion) }}
              </template>
            </Column>

            <Column
              field="cotizacion.compra"
              header="Cotización Positiva de procuraduria"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.cotizacion.compra }}
              </template>
            </Column>

            <Column
              field="cotizacion.penalizacion"
              header="Cotización negativa de procuraduria"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.cotizacion.penalizacion }}
              </template>
            </Column>

            <Column field="monto_pagar" header="Monto a pagar" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.monto_pagar }}
              </template>
            </Column>

            <ColumnGroup type="footer">
              <Row>
                <Column
                  footer="Total a pagar en ese rango de tiempo:"
                  :colspan="6"
                  footerStyle="text-align:right"
                />
                <Column :footer="totalMontoPagar.toFixed(2)" />
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabla de listado -->
  <div class="grid">
    <div class="col-12">
      <div class="card">
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
          @page="loadProcuradorPagosDeProc"
          @sort="loadProcuradorPagosDeProc"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Pagos realizados</h4>
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
              <Tag
                :value="slotProps.data.monto"
                :severity="slotProps.data.tipo === 'DEBITO' ? 'success' : 'danger'"
              /> </template
          ></Column>

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
          <Column field="fecha_fin_consulta" header="Fecha fin consulta" sortable>
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
          >Fecha de pago<i class="pi pi-calendar p-mr-2"></i
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
::v-deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

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
</style>
