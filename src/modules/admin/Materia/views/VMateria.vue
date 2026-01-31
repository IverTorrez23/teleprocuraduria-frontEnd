<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import MateriasService from '../services/materia.service'
import type { IMateria } from '../materia.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import materiaService from '../services/materia.service'

const toast = useToast()
const dt = ref()
const materias = ref<IMateria[]>([])
const materiaDialog = ref(false)
const deleteMateriaDialog = ref(false)
const deleteMateriasDialog = ref(false)
const materia = ref<IMateria>({
  id: 0,
  nombre: '',
  abreviatura: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedMaterias = ref<IMateria[]>([])
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

const loadMaterias = async (event?: DataTableSortEvent) => {
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
  const response = await materiaService.getMaterias(opciones)

  materias.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadMaterias()
})
watch(
  () => filters.value.global.value,
  () => {
    loadMaterias()
  }
)
const openNew = () => {
  materia.value = {} as IMateria
  submitted.value = false
  materiaDialog.value = true
}

const hideDialog = () => {
  materiaDialog.value = false
  submitted.value = false
}

const editMateria = (mat: IMateria) => {
  materia.value = { ...mat }
  materiaDialog.value = true
}

const confirmDeleteMateria = (mat: IMateria) => {
  materia.value = mat
  deleteMateriaDialog.value = true
}

const deleteMateria = async () => {
  try {
    if (materia.value && materia.value.id) {
      await MateriasService.deleteMateria(materia.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Materia Deleted',
        life: 3000
      })
      deleteMateriaDialog.value = false
      loadMaterias()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete materia',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteMateriasDialog.value = true
}

const deleteSelectedMaterias = () => {
  materias.value = materias.value.filter((val) => !selectedMaterias.value.includes(val))
  deleteMateriasDialog.value = false
  selectedMaterias.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Materias Deleted',
    life: 3000
  })
}

const saveMateria = async () => {
  submitted.value = true
  if (!materia.value?.nombre || !materia.value?.abreviatura) return

  try {
    if (materia.value.id) {
      await MateriasService.updateMateria(materia.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Materia Updated',
        life: 3000
      })
    } else {
      await MateriasService.createMateria(materia.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Materia Created',
        life: 3000
      })
    }
    hideDialog()
    loadMaterias()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save materia', life: 3000 })
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
          :value="materias"
          v-model:selection="selectedMaterias"
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
          @page="loadMaterias"
          @sort="loadMaterias"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Materias</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
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
                @click="editMateria(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteMateria(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="materiaDialog"
          :style="{ width: '450px' }"
          header="Materia"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="materia.nombre"
              required="true"
              autofocus
              :invalid="submitted && !materia.nombre"
            />
            <small class="p-error" v-if="submitted && !materia.nombre">Nombre es requerido.</small>
          </div>
          <div class="field">
            <label for="abreviatura">Abreviatura</label>
            <InputText
              id="abreviatura"
              v-model.trim="materia.abreviatura"
              required="true"
              autofocus
              :invalid="submitted && !materia?.abreviatura"
            />
            <small class="p-error" v-if="submitted && !materia?.abreviatura"
              >Abreviatura es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveMateria" />
          </template>
        </Dialog>

        <!-- dialog delete materia -->
        <Dialog
          v-model:visible="deleteMateriaDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="materia"
              >¿Estás segura de que quieres eliminar <b>{{ materia.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteMateriaDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteMateria" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteMateriasDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="materia"
              >¿Estás seguro de que deseas eliminar las materias seleccionadas?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteMateriasDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedMaterias"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
