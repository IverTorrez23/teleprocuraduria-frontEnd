<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useRoute } from 'vue-router'
import { isAbogadoAutorizado } from '@/common/utils/usuarioAutorizado'
import { TipoUsuario } from '@/constants/constants'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import ordenService from '../../services/orden.service'
import type { IOrden } from '../../types/orden.types'
import { TableSize } from '@/constants/constants'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

const route = useRoute()
const ordenes = ref<IOrden[]>([])

const idCausa = Number(route.params.idCausa)

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
  const response = await ordenService.getOrdenesVencidasLeves(opciones, idCausa)

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

const totalCompraJudicial = (): string => {
  let total = 0
  let monto: any
  ordenes.value.forEach((orden) => {
    if (orden.descarga && orden.descarga.compra_judicial !== null) {
      monto = orden.descarga.compra_judicial
      total += parseFloat(monto)
    }
  })
  return `${total.toFixed(2)}`
}
const totalVentaJudicial = (): string => {
  let total = 0
  let monto: any
  ordenes.value.forEach((orden) => {
    if (orden.final_costos && orden.final_costos.costo_procesal_venta !== null) {
      monto = orden.final_costos.costo_procesal_venta
      total += parseFloat(monto)
    }
  })
  return `${total.toFixed(2)}`
}
const totalCompraProcuraduria = (): string => {
  let total = 0
  let monto: any
  ordenes.value.forEach((orden) => {
    if (orden.final_costos && orden.final_costos.costo_procuraduria_compra !== null) {
      monto = orden.final_costos.costo_procuraduria_compra
      total += parseFloat(monto)
    }
  })
  return `${total.toFixed(2)}`
}
const totalVentaProcuraduria = (): string => {
  let total = 0
  let monto: any
  ordenes.value.forEach((orden) => {
    if (orden.final_costos && orden.final_costos.costo_procuraduria_venta !== null) {
      monto = orden.final_costos.costo_procuraduria_venta
      total += parseFloat(monto)
    }
  })
  return `${total.toFixed(2)}`
}
const totalSumaEgresos = (): string => {
  let total = 0
  let monto: any
  ordenes.value.forEach((orden) => {
    if (orden.final_costos && orden.final_costos.total_egreso !== null) {
      monto = orden.final_costos.total_egreso
      total += parseFloat(monto)
    }
  })
  return `${total.toFixed(2)}`
}
</script>

<template>
  <div class="card p-3">
    <Toast />
    <!-- Tabla de listado para procurador -->
    <DataTable
      v-if="usuario?.tipo === TipoUsuario.PROCURADOR"
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
          <h4 class="m-0">Listado de Ordenes Vencidas Leves</h4>

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
                `/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/` + slotProps.data.id
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

    <!-- Tabla para contador -->
    <DataTable
      v-if="usuario?.tipo === TipoUsuario.CONTADOR"
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
          <h4 class="m-0">Listado de Ordenes Vencidas Leves</h4>

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
                `/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/` + slotProps.data.id
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

    <!-- Tabla General -->
    <DataTable
      v-if="isAbogadoAutorizado"
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
      <ColumnGroup type="header">
        <Row>
          <Column header="# Orden" :rowspan="3" sortable field="id" />
          <Column header="COTIZACION" :colspan="5" />
          <Column header="FINANZAS" :colspan="5" />

          <Column header="Procurador" :rowspan="3" field="procurador.persona.nombre" />
          <Column header="Calificación" :rowspan="3" field="calificacion" />
        </Row>
        <Row>
          <Column header="Parametros Usados(Cotizacion Orden)" :colspan="2" />
          <Column header="Cotizacion de Procuraduria" :colspan="3" />

          <Column header="Costo Judicial (Bs.)" :colspan="2" />
          <Column header="Costo Procuraduria (Bs.)" :colspan="2" />
          <Column header="" />
        </Row>
        <Row>
          <Column header="Bandera" field="cotizacion.prioridad" />
          <Column header="Plazo" field="cotizacion.condicion" />
          <Column header="Compra" field="cotizacion.compra" />
          <Column header="Venta" field="cotizacion.venta" />
          <Column header="Penalidad" field="cotizacion.penalizacion" />

          <Column header="Compra" field="descarga.compra_judicial" />
          <Column header="Venta" field="final_costos.costo_procesal_venta" />
          <Column header="Compra (procurador)" field="final_costos.costo_procuraduria_compra" />
          <Column header="Venta (procurador)" field="final_costos.costo_procuraduria_venta" />
          <Column header="Total egreso (Bs.)" field="final_costos.total_egreso" :rowspan="3" />
        </Row>
      </ColumnGroup>
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Listado de Ordenes Vencidas Leves</h4>

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
                `/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/` + slotProps.data.id
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
      <Column field="cotizacion.venta">
        <template #body="slotProps"> {{ slotProps.data.cotizacion.venta }} </template>
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

      <Column field="final_costos.costo_procesal_venta">
        <template #body="slotProps">
          {{
            slotProps.data?.final_costos?.costo_procesal_venta
              ? slotProps.data.final_costos.costo_procesal_venta
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
      <Column field="final_costos.costo_procuraduria_venta">
        <template #body="slotProps">
          {{
            slotProps.data?.final_costos?.costo_procuraduria_venta
              ? slotProps.data.final_costos.costo_procuraduria_venta
              : 'No definido'
          }}
        </template>
      </Column>
      <Column field="final_costos.total_egreso">
        <template #body="slotProps">
          {{
            slotProps.data?.final_costos?.total_egreso
              ? slotProps.data.final_costos.total_egreso
              : 'No definido'
          }}
        </template>
      </Column>
      <Column field="procurador.persona.nombre">
        <template #body="slotProps">
          {{ slotProps.data?.procurador?.persona?.nombre }}
          {{ slotProps.data?.procurador?.persona?.apellido }}
        </template>
      </Column>
      <Column field="calificacion">
        <template #body="slotProps"> {{ slotProps.data.calificacion }} </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column footer="Totals:" :colspan="6" footerStyle="text-align:right" />
          <Column :footer="totalCompraJudicial()" />
          <Column :footer="totalVentaJudicial()" />
          <Column :footer="totalCompraProcuraduria()" />
          <Column :footer="totalVentaProcuraduria()" />
          <Column :footer="totalSumaEgresos()" />
          <Column footer="" />
          <Column footer="" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>
<style scoped lang="scss"></style>
