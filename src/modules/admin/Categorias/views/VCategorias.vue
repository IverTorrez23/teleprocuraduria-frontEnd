<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { ICategorias } from '../categorias.types'
import CategoriasService from '../services/categorias.service'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

const toast = useToast()
const dt = ref()
const categorias = ref<ICategorias[]>([])
const categoriaDialog = ref(false)
const deleteCategoriaDialog = ref(false)
const deleteCategoriasDialog = ref(false)
const categoria = ref<ICategorias>({
  id: 0,
  nombre: '',
  abreviatura: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedCategorias = ref<ICategorias[]>([])
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

const loadCategorias = async (event?: DataTableSortEvent) => {
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
  const response = await CategoriasService.getCategorias(opciones)

  categorias.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadCategorias()
})
watch(
  () => filters.value.global.value,
  () => {
    loadCategorias()
  }
)
const openNew = () => {
  categoria.value = {} as ICategorias
  submitted.value = false
  categoriaDialog.value = true
}

const hideDialog = () => {
  categoriaDialog.value = false
  submitted.value = false
}

const editCategoria = (mat: ICategorias) => {
  categoria.value = { ...mat }
  categoriaDialog.value = true
}

const confirmDeleteCategoria = (mat: ICategorias) => {
  categoria.value = mat
  deleteCategoriaDialog.value = true
}

const deleteCategoria = async () => {
  try {
    if (categoria.value && categoria.value.id) {
      await CategoriasService.deleteCategoria(categoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Categoria Deleted',
        life: 3000
      })
      deleteCategoriaDialog.value = false
      loadCategorias()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete categoria',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteCategoriasDialog.value = true
}

const deleteSelectedCategorias = () => {
  categorias.value = categorias.value.filter((val) => !selectedCategorias.value.includes(val))
  deleteCategoriasDialog.value = false
  selectedCategorias.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Categorias Deleted',
    life: 3000
  })
}

const saveCategoria = async () => {
  submitted.value = true
  if (!categoria.value?.nombre || !categoria.value?.abreviatura) return

  try {
    if (categoria.value.id) {
      await CategoriasService.updateCategoria(categoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Categoria Updated',
        life: 3000
      })
    } else {
      await CategoriasService.createCategoria(categoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Categoria Created',
        life: 3000
      })
    }
    hideDialog()
    loadCategorias()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save categoria',
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
              <Button
                label="Delete"
                icon="pi pi-trash"
                class="p-button-danger"
                @click="confirmDeleteSelected"
                :disabled="!selectedCategorias || !selectedCategorias.length"
              />
            </div>
          </template>

          <template #end>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="1000000"
              label="Import"
              chooseLabel="Import"
              class="mr-2 inline-block"
            />
            <Button
              label="Export"
              icon="pi pi-upload"
              class="p-button-help"
              @click="exportCSV()"
            />
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="categorias"
          v-model:selection="selectedCategorias"
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
          @page="loadCategorias"
          @sort="loadCategorias"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Categorias</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
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
                @click="editCategoria(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteCategoria(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="categoriaDialog"
          :style="{ width: '450px' }"
          header="Categoria"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="categoria.nombre"
              required="true"
              autofocus
              :invalid="submitted && !categoria.nombre"
            />
            <small class="p-error" v-if="submitted && !categoria.nombre"
              >Nombre es requerido.</small
            >
          </div>
          <div class="field">
            <label for="abreviatura">Abreviatura</label>
            <InputText
              id="abreviatura"
              v-model.trim="categoria.abreviatura"
              required="true"
              autofocus
              :invalid="submitted && !categoria?.abreviatura"
            />
            <small class="p-error" v-if="submitted && !categoria?.abreviatura"
              >Abreviatura es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveCategoria" />
          </template>
        </Dialog>

        <!-- dialog delete materia -->
        <Dialog
          v-model:visible="deleteCategoriaDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="categoria"
              >¿Estás segura de que quieres eliminar <b>{{ categoria.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteCategoriaDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteCategoria" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteCategoriasDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="categoria"
              >¿Estás seguro de que deseas eliminar las materias seleccionadas?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteCategoriasDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedCategorias"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
