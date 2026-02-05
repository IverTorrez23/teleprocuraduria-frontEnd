<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import DistritoService from '../services/distrito.service'
import type { IDistrito } from '../types/distrito.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

const toast = useToast()
const dt = ref()
const distritos = ref<IDistrito[]>([])
const distritoDialog = ref(false)
const deleteDistritoDialog = ref(false)
const deleteDistritosDialog = ref(false)
const distrito = ref<IDistrito>({
  id: 0,
  nombre: '',
  abreviatura: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedDistritos = ref<IDistrito[]>([])
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

const loadDistritos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombre', 'abreviatura'], keyword: filters.value.global.value }]
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
  const response = await DistritoService.getDistritos(opciones)

  distritos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadDistritos()
})
watch(
  () => filters.value.global.value,
  () => {
    loadDistritos()
  }
)

const openNew = () => {
  distrito.value = {} as IDistrito
  submitted.value = false
  distritoDialog.value = true
}

const hideDialog = () => {
  distritoDialog.value = false
  submitted.value = false
}

const editDistrito = (dis: IDistrito) => {
  distrito.value = { ...dis }
  distritoDialog.value = true
}

const confirmDeleteDistrito = (dis: IDistrito) => {
  distrito.value = dis
  deleteDistritoDialog.value = true
}

const deleteDistrito = async () => {
  try {
    if (distrito.value && distrito.value.id) {
      await DistritoService.deleteDistrito(distrito.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Distrito Deleted',
        life: 3000
      })
      deleteDistritoDialog.value = false
      loadDistritos()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Distrito',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteDistritosDialog.value = true
}

const deleteSelectedDistritos = () => {
  distritos.value = distritos.value.filter((val) => !selectedDistritos.value.includes(val))
  deleteDistritosDialog.value = false
  selectedDistritos.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Distritos Deleted',
    life: 3000
  })
}

const saveDistrito = async () => {
  submitted.value = true
  if (!distrito.value?.nombre || !distrito.value?.abreviatura) return

  try {
    if (distrito.value.id) {
      await DistritoService.updateDistrito(distrito.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Distrito Updated',
        life: 3000
      })
    } else {
      await DistritoService.createDistrito(distrito.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Distrito Created',
        life: 3000
      })
    }
    hideDialog()
    loadDistritos()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save distrito',
      life: 3000
    })
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
                :disabled="!selectedDistritos || !selectedDistritos.length"
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
          :value="distritos"
          v-model:selection="selectedDistritos"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} distritos"
          :autoLayout="true"
          :lazy="true"
          @page="loadDistritos"
          @sort="loadDistritos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Distritos</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
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
          <Column field="abreviatura" header="Abreviatura" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Abreviatura</span>
              {{ slotProps.data.abreviatura }}
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
                @click="editDistrito(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteDistrito(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit distrito -->
        <Dialog
          v-model:visible="distritoDialog"
          :style="{ width: '450px' }"
          header="Distrito"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="distrito.nombre"
              required="true"
              autofocus
              :invalid="submitted && !distrito.nombre"
            />
            <small class="p-error" v-if="submitted && !distrito.nombre">Nombre es requerido.</small>
          </div>
          <div class="field">
            <label for="abreviatura">Abreviatura</label>
            <InputText
              id="abreviatura"
              v-model.trim="distrito.abreviatura"
              required="true"
              autofocus
              :invalid="submitted && !distrito?.abreviatura"
            />
            <small class="p-error" v-if="submitted && !distrito?.abreviatura"
              >Abreviatura es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDistrito" />
          </template>
        </Dialog>

        <!-- dialog delete distrito -->
        <Dialog
          v-model:visible="deleteDistritoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="distrito"
              >¿Estás segura de que quieres eliminar <b>{{ distrito.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDistritoDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteDistrito" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteDistritosDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="distrito"
              >¿Estás seguro de que deseas eliminar los distritos seleccionados?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDistritosDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedDistritos"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
