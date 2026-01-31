<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import paqueteService from '../services/paquete.service'
import type { IPaquete } from '../types/paquete.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize, TipoPaquete } from '@/constants/constants'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'

const toast = useToast()
const dt = ref()
const paquetes = ref<IPaquete[]>([])
const paqueteDialog = ref(false)
const deletePaqueteDialog = ref(false)
const paquete = ref<IPaquete>({
  id: 0,
  nombre: '',
  precio: 0,
  cantidad_dias: 0,
  descripcion: '',
  fecha_creacion: '',
  usuario_id: 0,
  tiene_fecha_limite: 0,
  fecha_limite_compra: '',
  tipo: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedPaquetes = ref<IPaquete[]>([])
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

const loadPaquetes = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['nombre', 'precio', 'cantidad_dias', 'tiene_fecha_limite', 'descripcion'],
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
  const response = await paqueteService.getPaquetes(opciones)

  paquetes.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadPaquetes()
})
watch(
  () => filters.value.global.value,
  () => {
    loadPaquetes()
  }
)

const openNew = () => {
  paquete.value = {} as IPaquete
  paquete.value.tiene_fecha_limite = 0 //Por defecto no tiene fecha de expiracion
  submitted.value = false
  paqueteDialog.value = true
}

const hideDialog = () => {
  paqueteDialog.value = false
  submitted.value = false
}

const editPaquete = (paq: IPaquete) => {
  paquete.value = { ...paq }
  paqueteDialog.value = true
}

const confirmDeletePaquete = (paq: IPaquete) => {
  paquete.value = paq
  deletePaqueteDialog.value = true
}

const deletePaquete = async () => {
  try {
    if (paquete.value && paquete.value.id) {
      await paqueteService.deletePaquete(paquete.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Paquete Deleted',
        life: 3000
      })
      deletePaqueteDialog.value = false
      loadPaquetes()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Paquete',
      life: 3000
    })
  }
}

const savePaquete = async () => {
  submitted.value = true
  if (
    !paquete.value?.nombre ||
    !paquete.value?.precio ||
    !paquete.value?.cantidad_dias ||
    !paquete.value?.tipo ||
    (paquete.value?.tiene_fecha_limite && !paquete.value?.fecha_limite_compra)
  )
    return

  try {
    if (paquete.value.fecha_limite_compra) {
      const fechaLimiteCompra = new Date(paquete.value.fecha_limite_compra)
      console.log('fecha normal', paquete.value.fecha_limite_compra)
      console.log('fecha formateda', fechaLimiteCompra)
      if (!isNaN(fechaLimiteCompra.getTime())) {
        paquete.value.fecha_limite_compra = fechaLimiteCompra.toISOString().split('T')[0]
        console.log('fecha formateda nueva', paquete.value.fecha_limite_compra)
      }
    }

    if (paquete.value.id) {
      await paqueteService.updatePaquete(paquete.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Paquete Updated',
        life: 3000
      })
    } else {
      await paqueteService.createPaquete(paquete.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Paquete Created',
        life: 3000
      })
    }
    hideDialog()
    loadPaquetes()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Paquete',
      life: 3000
    })
  }
}

const onCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    paquete.value.tiene_fecha_limite = 1
  } else {
    paquete.value.tiene_fecha_limite = 0
  }
}

const rowStyle = (data: any) => {
  if (data.fecha_limite_compra) {
    const fechaLimite = new Date(data.fecha_limite_compra.replace(/-/g, '/'))
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Resetear hora para comparar solo fechas
    if (fechaLimite < hoy) {
      return {  fontStyle: 'italic', backgroundColor:'#f1f1f1', color:'#a9a9a9' }
    }
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
                label="New"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="paquetes"
          v-model:selection="selectedPaquetes"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Paquetes"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          :rowStyle="rowStyle"
          @page="loadPaquetes"
          @sort="loadPaquetes"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Paquetes</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <Column field="id" header="ID" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Id</span>
              {{ slotProps.data.id }}
            </template></Column
          >
          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Nombre</span>
              {{ slotProps.data.nombre }}
            </template></Column
          >
          <Column field="precio" header="Precio" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Precio</span>
              {{ slotProps.data.precio }}
            </template></Column
          >
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              {{ slotProps.data.tipo }}
            </template></Column
          >

          <Column field="cantidad_dias" header="Vigencia en días" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Cantidad Días</span>
              {{ slotProps.data.cantidad_dias }}
            </template></Column
          >

          <Column field="fecha_limite_compra" header="Fecha limite compra" sortable>
            <template #body="slotProps">
              <!-- <div :class="stockClass(slotProps.data)"> -->
              <span class="p-column-title">Fecha limite compra</span>
              {{ slotProps.data.fecha_limite_compra }}
              <!-- </div> -->
            </template></Column
          >

          <Column field="descripcion" header="Descripción" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Descripción</span>
              {{ slotProps.data.descripcion }}
            </template></Column
          >

          <Column field="estado" header="Estado">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.estado"
                :severity="getEstado(slotProps.data.estado)"
              /> </template
          ></Column>

          <Column header="Acciones">
            <template #body="slotProps">
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editPaquete(slotProps.data)"
              />
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeletePaquete(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit -->
        <Dialog
          v-model:visible="paqueteDialog"
          :style="{ width: '450px' }"
          header="Paquete"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="paquete.nombre"
              required="true"
              autofocus
              :invalid="submitted && !paquete.nombre"
            />
            <small class="p-error" v-if="submitted && !paquete.nombre">Nombre es requerido.</small>
          </div>
          <div class="field">
            <label for="descripcion">Descripción</label>
            <InputText
              id="descripcion"
              v-model.trim="paquete.descripcion"
              required="true"
              autofocus
              :invalid="submitted && !paquete?.descripcion"
            />
            <small class="p-error" v-if="submitted && !paquete?.descripcion"
              >Decripción es requerido.</small
            >
          </div>

          <div class="field">
            <label for="precio">Precio</label>
            <InputNumber
              id="precio"
              v-model="paquete.precio"
              required="true"
              autofocus
              :invalid="submitted && !paquete?.precio"
            />
            <small class="p-error" v-if="submitted && !paquete?.precio">Precio es requerido.</small>
          </div>

          <div class="field">
            <label for="cantidad_dias">Cantidad Días</label>
            <InputNumber
              id="cantidad_dias"
              v-model="paquete.cantidad_dias"
              required="true"
              autofocus
              :invalid="submitted && !paquete?.cantidad_dias"
            />
            <small class="p-error" v-if="submitted && !paquete?.cantidad_dias"
              >Cantidad dias es requerido.</small
            >
          </div>

          <div class="field">
            <label for="tipo">Tipo</label>
            <Dropdown
              id="tipo"
              v-model="paquete.tipo"
              :options="TipoPaquete"
              optionLabel="label"
              optionValue="value"
              filter
              filterPlaceholder="Buscar Tipo"
              :invalid="submitted && !paquete?.tipo"
            />
            <small class="p-error" v-if="submitted && !paquete?.tipo">Tipo es requerido.</small>
          </div>

          <div class="field">
            <label for="tiene_fecha_limite">Tiene fecha limite ?</label>
            <div
              class="flex items-center"
              v-tooltip="'Si selecciona la opción debe selccionar una fecha'"
              style="width: 60%"
            >
              <Checkbox
                v-model="paquete.tiene_fecha_limite"
                :true-value="1"
                :false-value="0"
                indeterminate
                binary
                @change="onCheckboxChange"
              />
              &nbsp;
              <Tag value="Tiene fecha limite de compra" severity="info" />
            </div>
          </div>

          <div class="field">
            <label for="fecha_limite_compra">Fecha limite</label>
            <Calendar
              :disabled="paquete.tiene_fecha_limite !== 1"
              id="fecha_limite_compra"
              :modelValue="
                paquete.fecha_limite_compra
                  ? new Date(paquete.fecha_limite_compra.replace(/-/g, '/'))
                  : null
              "
              @update:modelValue="
                (date) => (paquete.fecha_limite_compra = date ? formatearFechaHora(date) : '')
              "
              :minDate="new Date()"
              dateFormat="yy/mm/dd"
              showButtonBar
              showIcon
              iconDisplay="input"
            />
            <small
              class="p-error"
              v-if="submitted && !paquete?.fecha_limite_compra && paquete.tiene_fecha_limite === 1"
              >Fecha limite requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="savePaquete" />
          </template>
        </Dialog>

        <!-- dialog delete  -->
        <Dialog
          v-model:visible="deletePaqueteDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="paquete"
              >¿Estás segura de que quieres eliminar <b>{{ paquete.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deletePaqueteDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePaquete" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
