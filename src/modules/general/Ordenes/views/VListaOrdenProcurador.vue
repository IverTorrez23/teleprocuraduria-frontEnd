<script setup lang="ts">
import type { IOrden } from '../types/orden.types'
import { ref, onMounted, watch, defineProps } from 'vue'
import { FilterMatchMode } from 'primevue/api'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
import ordenService from '../services/orden.service'
import { TableSize } from '@/constants/constants'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
const props = defineProps({
  causaId: {
    type: Number,
    required: true
  },
  procuradorId: {
    type: Number,
    required: true
  }
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
  const response = await ordenService.getOrdenesPorProcurador(
    opciones,
    props.causaId,
    props.procuradorId
  )

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
      :rowsPerPageOptions="[5, 10, 25, 100]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ordenes"
      :autoLayout="true"
      :lazy="true"
      @page="loadOrden"
      @sort="loadOrden"
      tableStyle="min-width: 50rem"
      :size="TableSize.small"
      showGridlines
    >
      <ColumnGroup type="header">
        <Row>
          <Column header="# Orden" :rowspan="3" sortable field="id" />
          <Column header="COTIZACION" :colspan="4" />
          <Column header="FINANZAS" :colspan="2" />
        </Row>
        <Row>
          <Column header="Parametros Usados(Cotizacion Orden)" :colspan="2" />
          <Column header="Cotizacion de Procuraduria" :colspan="2" />

          <Column header="Costo Judicial (Bs.)" :colspan="1" />
          <Column header="Costo Procuraduria (Bs.)" :colspan="1" />
        </Row>
        <Row>
          <Column header="Bandera" field="cotizacion.prioridad" />
          <Column header="Plazo" field="cotizacion.condicion" />
          <Column header="Compra" field="cotizacion.compra" />
          <Column header="Penalidad" field="cotizacion.penalizacion" />
          <Column header="Compra" field="descarga.compra_judicial" />
          <Column header="Compra (procurador)" field="final_costos.costo_procuraduria_compra" />
        </Row>
      </ColumnGroup>
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

      <Column field="id">
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
      <Column field="cotizacion.prioridad">
        <template #body="slotProps"> {{ slotProps.data.cotizacion.prioridad }} </template>
      </Column>
      <Column field="cotizacion.condicion">
        <template #body="slotProps">
          {{ plazoSegunCondicion(slotProps.data.cotizacion.condicion) }}
        </template>
      </Column>
      <Column field="cotizacion.compra">
        <template #body="slotProps"> {{ slotProps.data.cotizacion.compra }} </template>
      </Column>

      <Column field="cotizacion.penalizacion">
        <template #body="slotProps"> {{ slotProps.data.cotizacion.penalizacion }} </template>
      </Column>
      <Column field="descarga.compra_judicial">
        <template #body="slotProps">
          {{
            slotProps.data?.descarga?.compra_judicial
              ? slotProps.data.descarga.compra_judicial
              : 'No definido'
          }}
        </template>
      </Column>

      <Column field="final_costos.costo_procuraduria_compra">
        <template #body="slotProps">
          {{
            slotProps.data?.final_costos?.costo_procuraduria_compra
              ? slotProps.data.final_costos.costo_procuraduria_compra
              : 'No definido'
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
