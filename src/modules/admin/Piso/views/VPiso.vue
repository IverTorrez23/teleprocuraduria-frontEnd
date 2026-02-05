<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import PisoService from '../services/piso.service'
import type { IPiso } from '../types/piso.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

const toast = useToast()
const dt = ref()
const pisos = ref<IPiso[]>([])
const pisoDialog = ref(false)
const deletePisoDialog = ref(false)
const deletePisosDialog = ref(false)
const piso = ref<IPiso>({
  id: 0,
  nombre: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedPisos = ref<IPiso[]>([])
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

const loadPisos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombre'], keyword: filters.value.global.value }]
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
  const response = await PisoService.getPisos(opciones)

  pisos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadPisos()
})
watch(
  () => filters.value.global.value,
  () => {
    loadPisos()
  }
)
const openNew = () => {
  piso.value = {} as IPiso
  submitted.value = false
  pisoDialog.value = true
}

const hideDialog = () => {
  pisoDialog.value = false
  submitted.value = false
}

const editPiso = (ps: IPiso) => {
  piso.value = { ...ps }
  pisoDialog.value = true
}

const confirmDeletePiso = (ps: IPiso) => {
  piso.value = ps
  deletePisoDialog.value = true
}

const deletePiso = async () => {
  try {
    if (piso.value && piso.value.id) {
      await PisoService.deletePiso(piso.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Piso Deleted',
        life: 3000
      })
      deletePisoDialog.value = false
      loadPisos()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Piso',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deletePisosDialog.value = true
}

const deleteSelectedPisos = () => {
  pisos.value = pisos.value.filter((val) => !selectedPisos.value.includes(val))
  deletePisosDialog.value = false
  selectedPisos.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Pisos Deleted',
    life: 3000
  })
}

const savePiso = async () => {
  submitted.value = true
  if (!piso.value?.nombre) return

  try {
    if (piso.value.id) {
      await PisoService.updatePiso(piso.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Piso Updated',
        life: 3000
      })
    } else {
      await PisoService.createPiso(piso.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Piso Created',
        life: 3000
      })
    }
    hideDialog()
    loadPisos()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save Piso', life: 3000 })
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
              <!-- <Button
                label="Delete"
                icon="pi pi-trash"
                class="p-button-danger"
                @click="confirmDeleteSelected"
                :disabled="!selectedPisos || !selectedPisos.length"
              /> -->
            </div>
          </template>

          <!-- <template #end>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="1000000"
              label="Import"
              chooseLabel="Import"
              class="mr-2 inline-block"
            />
            <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV()" />
          </template> -->
        </Toolbar>

        <DataTable
          ref="dt"
          :value="pisos"
          v-model:selection="selectedPisos"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pisos"
          :autoLayout="true"
          :lazy="true"
          @page="loadPisos"
          @sort="loadPisos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Pisos</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
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
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editPiso(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeletePiso(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="pisoDialog"
          :style="{ width: '450px' }"
          header="Piso"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="piso.nombre"
              required="true"
              autofocus
              :invalid="submitted && !piso.nombre"
            />
            <small class="p-error" v-if="submitted && !piso.nombre">Nombre es requerido.</small>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="savePiso" />
          </template>
        </Dialog>

        <!-- dialog delete piso -->
        <Dialog
          v-model:visible="deletePisoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="piso"
              >¿Estás segura de que quieres eliminar <b>{{ piso.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deletePisoDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePiso" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deletePisosDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="piso">¿Estás seguro de que deseas eliminar los pisos seleccionados?</span>
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deletePisosDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedPisos"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
