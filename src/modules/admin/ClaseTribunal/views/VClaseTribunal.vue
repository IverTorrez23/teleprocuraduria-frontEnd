<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { IClaseTribunal } from '../types/clase-tribunal.types'
import claseTribunalService from '../services/clase-tribunal.service'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize } from '@/constants/constants'

const toast = useToast()
const dt = ref()
const claseTribunales = ref<IClaseTribunal[]>([])
const claseTribunalDialog = ref(false)
const deleteClaseTribunalDialog = ref(false)
const deleteClaseTribunalesDialog = ref(false)
const claseTribunal = ref<IClaseTribunal>({
  id: 0,
  nombre: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedClaseTribunales = ref<IClaseTribunal[]>([])
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

const loadClaseTribunales = async (event?: DataTableSortEvent) => {
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
  const response = await claseTribunalService.getClaseTribunal(opciones)

  claseTribunales.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadClaseTribunales()
})
watch(
  () => filters.value.global.value,
  () => {
    loadClaseTribunales()
  }
)
const openNew = () => {
  claseTribunal.value = {} as IClaseTribunal
  submitted.value = false
  claseTribunalDialog.value = true
}

const hideDialog = () => {
  claseTribunalDialog.value = false
  submitted.value = false
}

const editClaseTribunal = (clst: IClaseTribunal) => {
  console.log('clst', clst)
  claseTribunal.value = { ...clst }
  claseTribunalDialog.value = true
}

const confirmDeleteClaseTribunal = (clst: IClaseTribunal) => {
  claseTribunal.value = clst
  deleteClaseTribunalDialog.value = true
}

const deleteClaseTribunal = async () => {
  try {
    if (claseTribunal.value && claseTribunal.value.id) {
      await claseTribunalService.deleteClaseTribunal(claseTribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Clase Tribunal Deleted',
        life: 3000
      })
      deleteClaseTribunalDialog.value = false
      loadClaseTribunales()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Clase Tribunal',
      life: 3000
    })
  }
}

const deleteSelectedClaseTribunales = () => {
  claseTribunales.value = claseTribunales.value.filter(
    (val) => !selectedClaseTribunales.value.includes(val)
  )
  deleteClaseTribunalesDialog.value = false
  selectedClaseTribunales.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Clase tribunal Deleted',
    life: 3000
  })
}

const saveClaseTribunal = async () => {
  submitted.value = true
  if (!claseTribunal.value?.nombre) return

  try {
    if (claseTribunal.value.id) {
      await claseTribunalService.updateClaseTribunal(claseTribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Clase Tribunal Updated',
        life: 3000
      })
    } else {
      await claseTribunalService.createClaseTribunal(claseTribunal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Clase Tribunal Created',
        life: 3000
      })
    }
    hideDialog()
    loadClaseTribunales()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Clase Tribunal',
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
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="claseTribunales"
          v-model:selection="selectedClaseTribunales"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} materias"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          @page="loadClaseTribunales"
          @sort="loadClaseTribunales"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Clase Tribunal</h4>
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
            </template>
          </Column>
          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Nombre</span>
              {{ slotProps.data.nombre }}
            </template>
          </Column>

          <Column field="estado" header="Estado">
            <template #body="slotProps">
              <Tag :value="slotProps.data.estado" :severity="getEstado(slotProps.data.estado)" />
            </template>
          </Column>

          <Column header="Acciones">
            <template #body="slotProps">
              <Button
                style="width: 30px; height: 30px;"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editClaseTribunal(slotProps.data)"
              />
              <Button
                style="width: 30px; height: 30px;"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mr-2"
                @click="confirmDeleteClaseTribunal(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="claseTribunalDialog"
          :style="{ width: '450px' }"
          header="Clase Tribunal"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="claseTribunal.nombre"
              required="true"
              autofocus
              :invalid="submitted && !claseTribunal.nombre"
            />
            <small class="p-error" v-if="submitted && !claseTribunal.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveClaseTribunal"
            />
          </template>
        </Dialog>

        <!-- dialog delete materia -->
        <Dialog
          v-model:visible="deleteClaseTribunalDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="claseTribunal"
              >¿Estás segura de que quieres eliminar <b>{{ claseTribunal.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteClaseTribunalDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteClaseTribunal"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteClaseTribunalesDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="claseTribunal"
              >¿Estás seguro de que deseas eliminar los registros seleccionados?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteClaseTribunalesDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedClaseTribunales"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
