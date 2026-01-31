<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { TableSize, getTipoSeverityTrn } from '@/constants/constants'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { IBilleteraTransaccion } from '../../BilleteraTransaccion/types/billeteraTransaccion.types'
import type { ITransaccionesCausa } from '../../TransaccionesCausas/types/transaccionesCausas.types'
import transaccionesCausasService from '../../TransaccionesCausas/services/transaccionesCausas.service'

const route = useRoute()
const causaId = Number(route.params.idCausa)

const dt = ref()

const transaccionDialog = ref(false)
const transaccionesCausaDialog = ref(false)
const transaccionesDeCausa = ref<ITransaccionesCausa[]>([])
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

const loadTransaccionesDeUnaCausa = async (event?: DataTableSortEvent) => {
    try{
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['fecha_transaccion', 'monto', 'tipo', 'glosa', 'transaccion'],
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

  const response = await transaccionesCausasService.getTransaccionesDeUnaCausa(opciones, causaId)

  transaccionesDeCausa.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage 
}catch (error) {
    console.error("Error al cargar las transacciones:", error)
  } finally {
    console.error("Finalizo con exito:")
  }
}

onMounted(() => {
  loadTransaccionesDeUnaCausa()
})
watch(
  () => filters.value.global.value,
  () => {
    loadTransaccionesDeUnaCausa()
  }
)

const openNew = () => {
  billeteratransaccion.value = {} as IBilleteraTransaccion
  submitted.value = false
  transaccionDialog.value = true
}

const hideDialog = () => {
  transaccionDialog.value = false
  submitted.value = false
  transaccionesCausaDialog.value = false
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
             <i>Transacciones que se han realizado en esta causa</i> 
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="transaccionesDeCausa"
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
          @page="loadTransaccionesDeUnaCausa"
          @sort="loadTransaccionesDeUnaCausa"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Transacciones de Causa</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>
          <template #loading> Cargando los registros... </template>
          <template #empty> No se encontraron registros. </template>
          

          <Column field="id" header="ID" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Id</span>
              {{ slotProps.data.id }}
            </template></Column
          >
          <Column field="fecha_transaccion" header="Fecha Transacción" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha</span>
              {{ slotProps.data.fecha_transaccion }}
            </template></Column
          >
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              <Tag :value="slotProps.data.tipo" :severity="getTipoSeverityTrn(slotProps.data.tipo)" />
            </template>
          </Column>
          <Column field="glosa" header="Glosa" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Glosa</span>
              {{ slotProps.data.glosa }}
            </template></Column
          >
          <Column field="monto" header="Monto" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Monto</span>
              {{ slotProps.data.monto }}
            </template></Column
          >

          <Column field="estado" header="Estado">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.estado"
                :severity="getEstado(slotProps.data.estado)"
              /> </template
          ></Column>
        </DataTable>

      </div>
    </div>
  </div>

</template>
<style scoped lang="scss"></style>
