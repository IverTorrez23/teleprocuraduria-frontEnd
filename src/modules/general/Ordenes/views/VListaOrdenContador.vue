<script setup lang="ts">
import type { IOrden } from '../types/orden.types'
import { ref, onMounted, watch, defineProps } from 'vue'
import { FilterMatchMode } from 'primevue/api'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import ordenService from '../services/orden.service'
import { TableSize } from '@/constants/constants'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
const props = defineProps({
  causaId: Number
})
const ordenes = ref<IOrden[]>([])

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
const loadOrden = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['id', 'prioridad'], keyword: filters.value.global.value }]
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
  const response = await ordenService.getOrdenes(opciones, props.causaId)

  ordenes.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}
onMounted(() => {
  loadOrden()
})
watch(
  () => filters.value.global.value,
  () => {
    loadOrden()
  }
)
</script>

<template>
  <div class="card p-3">
    <DataTable
      ref="dt"
      :value="ordenes"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ordenes"
      :autoLayout="true"
      :lazy="true"
      @page="loadOrden"
      @sort="loadOrden"
      tableStyle="min-width: 50rem"
      :size="TableSize.small"
      showGridlines
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Listado de Ordenes</h4>

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

      <Column field="id" header="# Orden">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.id}`"
            link
            @click="
              $router.push(
                `/causas/ficha/lista-ordenes/${props.causaId}/detalle-orden/` + slotProps.data.id
              )
            "
          />
        </template>
      </Column>
      <Column field="presupuesto.monto" header="Presupuesto entregado">
        <template #body="slotProps">
          {{ slotProps.data?.presupuesto?.fecha_entrega ? slotProps.data.presupuesto.monto : '' }}
        </template>
      </Column>
      <Column field="descarga.compra_judicial" header="Presupuesto gastado">
        <template #body="slotProps">
          {{
            slotProps.data?.descarga?.fecha_descarga ? slotProps.data.descarga.compra_judicial : ''
          }}
        </template>
      </Column>
      <Column field="descarga.saldo" header="Saldo por devolver">
        <template #body="slotProps">
          {{ slotProps.data?.descarga?.fecha_descarga ? slotProps.data.descarga.saldo : '' }}
        </template>
      </Column>
      <Column field="procurador.persona.nombre" header="Procurador">
        <template #body="slotProps">
          {{ slotProps.data?.procurador?.persona?.nombre }}
          {{ slotProps.data?.procurador?.persona?.apellido }}
        </template>
      </Column>
      <Column field="fecha_giro" header="Fecha Giro">
        <template #body="slotProps"> {{ formatearFechaHora(slotProps.data.fecha_giro) }} </template>
      </Column>
      <Column field="presupuesto.fecha_presupuesto" header="Fecha presupuesto">
        <template #body="slotProps">
          {{
            slotProps.data?.presupuesto?.fecha_presupuesto
              ? formatearFechaHora(slotProps.data.presupuesto.fecha_presupuesto)
              : ''
          }}
        </template>
      </Column>
      <Column field="presupuesto.fecha_entrega" header="Fecha enrega presupuesto">
        <template #body="slotProps">
          {{
            slotProps.data?.presupuesto?.fecha_entrega
              ? formatearFechaHora(slotProps.data.presupuesto.fecha_entrega)
              : ''
          }}
        </template>
      </Column>
      <Column field="descarga.fecha_descarga" header="Fecha descarga">
        <template #body="slotProps">
          {{
            slotProps.data?.descarga?.fecha_descarga
              ? formatearFechaHora(slotProps.data.descarga.fecha_descarga)
              : ''
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
