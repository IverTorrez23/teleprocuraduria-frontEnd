<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { TableSize } from '@/constants/constants'
//import type { IDevolucionSaldo } from '../types/devolucionSaldo.types'
import type { IDevolucionSaldo } from '@/modules/admin/DevolucionSaldos/types/devolucionSaldo.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { DataTableSortEvent } from 'primevue/datatable'
//import devolucionSaldoService from '../services/devolucionSaldo.service'
import devolucionSaldoService from '@/modules/admin/DevolucionSaldos/services/devolucionSaldo.service'
import billeteraService from '@/modules/general/Billetera/services/billetera.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
import type { IBilleteraUsuario } from '@/modules/general/Billetera/types/billetera.types'
import type { IBilleteraTransaccion } from '../../BilleteraTransaccion/types/billeteraTransaccion.types'
import billeteraTransaccionService from '../../BilleteraTransaccion/services/billeteraTransaccion.service'
import type { DropdownChangeEvent } from 'primevue/dropdown'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const dt = ref()
const dtCausas = ref()

const devolucionDialog = ref(false)
const loadingButtonSave = ref(false)
const DetalleDevolucionDialog = ref(false)
const detalleDevolucion = ref<IBilleteraTransaccion>()
const billeteraUsuarios = ref<IBilleteraUsuario[]>([])
const devolucionSaldos = ref<IDevolucionSaldo[]>([])
const billeteraDepPorAdmin = ref<IBilleteraTransaccion[]>([])
const devolucionSaldo = ref<IDevolucionSaldo>({
  id: 0,
  monto: 0,
  glosa: '',
  billetera_id: 0
} as IDevolucionSaldo)

const billeteratransaccion = ref<IBilleteraTransaccion>({
  id: 0,
  monto: 0,
  billetera_id: 0
} as IBilleteraTransaccion)

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

const loadDevoluciones = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['fecha_devolucion', 'monto', 'glosa'],
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

  const response = await devolucionSaldoService.getDevolucionesSaldo(opciones)

  devolucionSaldos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadTransaccionesDepBilleteraAdmin = async (event?: DataTableSortEvent) => {
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

  const response = await billeteraTransaccionService.getTransaccionesDepBilleteraAdmin(
    opciones
  )

  billeteraDepPorAdmin.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadBilleteraConUsuarios = async () => {
  const result = await billeteraService.listadoConUsuarios()

  if (result.data) {
    billeteraUsuarios.value =
      result.data?.map((billetera) => ({
        ...billetera,
        usuarioBilletera: `${billetera.abogado?.persona?.nombre || ''} ${billetera.abogado?.persona?.apellido || ''} - Saldo Bs. ${billetera.monto || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las billeteras generales.',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDevoluciones()
  loadBilleteraConUsuarios()
  loadTransaccionesDepBilleteraAdmin()
})
watch(
  () => filters.value.global.value,
  () => {
    loadDevoluciones()
    loadTransaccionesDepBilleteraAdmin()
  }
)

const openNew = () => {
  billeteratransaccion.value = {} as IBilleteraTransaccion
  submitted.value = false
  devolucionDialog.value = true
}

const hideDialog = () => {
  devolucionDialog.value = false
  submitted.value = false
  DetalleDevolucionDialog.value = false
}

const saveTransaccion = async () => {
  submitted.value = true
 // billeteratransaccion.value.billetera_id = billetera.value?.id ? billetera.value?.id : 0
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
    loadDevoluciones()
    loadBilleteraConUsuarios()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 3000
    })
  }finally {
    submitted.value = false
    loadingButtonSave.value = false
  }
}

/*const saveTransaccion = async () => {
  submitted.value = true
  if (!devolucionSaldo.value?.billetera_id || !devolucionSaldo.value?.glosa) return
  loadingButtonSave.value = true

  try {
    if (devolucionSaldo.value?.billetera_id) {
      await devolucionSaldoService.createDevolucionSaldo(devolucionSaldo.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Transaccion  registrada',
        life: 3000
      })
    }
    hideDialog()
    loadDevoluciones()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al devolver saldo.',
      life: 10000
    })
  } finally {
    submitted.value = false
    loadingButtonSave.value = false
  }
}*/

const verDetalleTransaccion = async (detTrnDevolucion: IBilleteraTransaccion) => {
  DetalleDevolucionDialog.value = true
  detalleDevolucion.value = { ...detTrnDevolucion }
}

const onSelectBilletera = (event: DropdownChangeEvent) => {
  const idSeleccionado = event.value
  const billeteraSeleccionada = billeteraUsuarios.value.find((b) => b.id === idSeleccionado)

  if (billeteraSeleccionada) {
    devolucionSaldo.value.monto = Number(billeteraSeleccionada.monto) || 0

    // También puedes acceder a otros campos si los necesitas
    console.log('devolucionSaldo.value.monto:', devolucionSaldo.value.monto)
  }
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
                label="Depositar a Billetera"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="billeteraDepPorAdmin"
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
          @page="loadDevoluciones"
          @sort="loadDevoluciones"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Depositos a Billetera</h4>
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
          <Column field="fecha_transaccion" header="Fecha devolución" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Fecha transaccion</span>
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
    v-model:visible="DetalleDevolucionDialog"
    :style="{ width: '450px' }"
    header="Detalle de devolución"
    :modal="true"
    class="p-fluid"
  >
    <div class="p-grid p-dir-col">
      <div class="field p-mb-3">
        <label class="p-text-bold" for="monto">Monto <i class="pi pi-money-bill p-mr-2"></i></label>
        <div class="field-value">
          {{ detalleDevolucion?.monto }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="fecha"
          >Fecha transaccion<i class="pi pi-calendar p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleDevolucion?.fecha_transaccion }}
        </div>
      </div>

      <div class="field p-mb-3">
        <label class="p-text-bold" for="glosa"
          >Glosa <i class="pi pi-info-circle p-mr-2"></i
        ></label>
        <div class="field-value">
          {{ detalleDevolucion?.glosa }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Ok" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
    </template>
  </Dialog>

  <!-- save modal -->
  <Dialog
    v-model:visible="devolucionDialog"
    :style="{ width: '450px' }"
    header="Deposito"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="billetera_id">Abogado</label>
      <Dropdown
        id="billetera_id"
        v-model="billeteratransaccion.billetera_id"
        :options="billeteraUsuarios"
        optionLabel="usuarioBilletera"
        optionValue="id"
        filter
        filterPlaceholder="Buscar abogado"
        :invalid="submitted && !billeteratransaccion.billetera_id"
        @change="onSelectBilletera"
      />
      <small class="p-error" v-if="submitted && !billeteratransaccion.billetera_id"
        >Debe seleccionar la billetera para depositar.</small
      >
    </div>

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

    <!-- <div class="field">
      <label for="glosa">Glosa</label>
      <Textarea
        v-model="devolucionSaldo.glosa"
        rows="5"
        cols="30"
        required="true"
        :invalid="submitted && !devolucionSaldo.glosa"
      />
      <small class="p-error" v-if="submitted && !devolucionSaldo.glosa">Glosa es requerido.</small>
    </div> -->

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
