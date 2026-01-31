<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import TipoLegalService from '../services/tipo-legal.service'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { ITipoLegal } from '../tipo-lega.types'
import type { IMateria } from '../../Materia/materia.types'
import materiaService from '../../Materia/services/materia.service'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import tipoLegalService from '../services/tipo-legal.service'

const toast = useToast()
const dt = ref()
const tipoLegales = ref<ITipoLegal[]>([])
const materias = ref<IMateria[]>([])
const tipoLegalDialog = ref(false)
const deleteTipoLegalDialog = ref(false)
const deleteTipoLegalesDialog = ref(false)
const tipoLegal = ref<ITipoLegal>({ nombre: '', abreviatura: '', materia_id: 0 } as ITipoLegal)
const selectedTipoLegales = ref<ITipoLegal[]>([])
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

const loadTipoLegal = async (event?: DataTableSortEvent) => {
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
  const response = await tipoLegalService.getTipoLegal(opciones)

  tipoLegales.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}
const loadMaterias = async () => {
  const response = await materiaService.listarMaterias()
  if (response) {
    materias.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch materias',
      life: 3000
    })
  }
}
onMounted(() => {
  loadTipoLegal()
  loadMaterias()
})
watch(
  () => filters.value.global.value,
  () => {
    loadTipoLegal()
  }
)
const openNew = () => {
  tipoLegal.value = {} as ITipoLegal
  submitted.value = false
  tipoLegalDialog.value = true
}

const hideDialog = () => {
  tipoLegalDialog.value = false
  submitted.value = false
}

const editTipoLegal = (tipo: ITipoLegal) => {
  tipoLegal.value = { ...tipo }
  tipoLegalDialog.value = true
}

const confirmDeleteTipoLegal = (tipo: ITipoLegal) => {
  tipoLegal.value = tipo
  deleteTipoLegalDialog.value = true
}

const deleteTipoLegal = async () => {
  try {
    if (tipoLegal.value && tipoLegal.value.id) {
      await TipoLegalService.deleteTipoLegal(tipoLegal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tipo Legal Deleted',
        life: 3000
      })
      deleteTipoLegalDialog.value = false
      loadTipoLegal()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete tipo legal',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteTipoLegalesDialog.value = true
}

const deleteSelectedTipoLegales = () => {
  tipoLegales.value = tipoLegales.value.filter((val) => !selectedTipoLegales.value.includes(val))
  deleteTipoLegalesDialog.value = false
  selectedTipoLegales.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Tipo Legales Deleted',
    life: 3000
  })
}

const saveTipoLegal = async () => {
  submitted.value = true
  if (!tipoLegal.value?.nombre || !tipoLegal.value?.abreviatura || !tipoLegal.value?.materia_id)
    return

  try {
    if (tipoLegal.value.id) {
      await TipoLegalService.updateTipoLegal(tipoLegal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tipo Legal Updated',
        life: 3000
      })
    } else {
      await TipoLegalService.createTipoLegal(tipoLegal.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tipo Legal Created',
        life: 3000
      })
    }
    hideDialog()
    loadTipoLegal()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save tipo legal',
      life: 3000
    })
  }
}
</script>

<template>
  <div class="card">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          @click="confirmDeleteSelected"
          :disabled="!selectedTipoLegales || !selectedTipoLegales.length"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="tipoLegales"
      v-model:selection="selectedTipoLegales"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos legales"
      :autoLayout="true"
      :lazy="true"
      @page="loadTipoLegal"
      @sort="loadTipoLegal"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Administrar Tipo Legal</h4>

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

      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
      <Column field="id" header="ID" sortable style="min-width: 3rem"></Column>
      <Column field="nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
      <Column field="abreviatura" header="Abreviatura" sortable style="min-width: 16rem"></Column>

      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado"
            :severity="getEstado(slotProps.data.estado)"
          /> </template
      ></Column>

      <Column field="materia_id" header="Materia" style="min-width: 6rem"> </Column>

      <Column
        header="Acciones"
        style="min-width: 8rem"
        headerClass="flex justify-content-center align-items-center"
      >
        <template #body="slotProps">
          <div class="flex justify-content-center align-items-center gap-2">
            <Button
              v-tooltip.bottom="'Editar'"
              icon="pi pi-pencil"
              rounded
              severity="success"
              class="mr-1"
              @click="editTipoLegal(slotProps.data)"
            />
            <Button
              v-tooltip.bottom="'Eliminar'"
              icon="pi pi-trash"
              rounded
              severity="danger"
              @click="confirmDeleteTipoLegal(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- create and edit modal -->
    <Dialog
      v-model:visible="tipoLegalDialog"
      :style="{ width: '450px' }"
      header="Tipo Legal"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="nombre">Nombre</label>
        <InputText
          id="nombre"
          v-model.trim="tipoLegal.nombre"
          required="true"
          autoFocus
          :invalid="submitted && !tipoLegal.nombre"
        />
        <small class="p-error" v-if="submitted && !tipoLegal.nombre">Nombre es requerido.</small>
      </div>

      <div class="field">
        <label for="abreviatura">Abreviatura</label>
        <InputText
          id="abreviatura"
          v-model.trim="tipoLegal.abreviatura"
          required="true"
          autofocus
          :invalid="submitted && !tipoLegal?.abreviatura"
        />
        <small class="p-error" v-if="submitted && !tipoLegal?.abreviatura"
          >Abreviatura es requerido.</small
        >
      </div>

      <div class="field">
        <label for="materia_id">Materia</label>
        <Dropdown
          id="materia"
          v-model="tipoLegal.materia_id"
          :options="materias"
          optionValue="id"
          optionLabel="nombre"
          filter
          filterPlaceholder="Buscar Materia"
          :invalid="submitted && !tipoLegal?.materia_id"
        />
        <small class="p-error" v-if="submitted && !tipoLegal?.materia_id"
          >Materia es requerido.</small
        >
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveTipoLegal" />
      </template>
    </Dialog>

    <!-- delete modal -->
    <Dialog
      v-model:visible="deleteTipoLegalDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="tipoLegal"
          >¿Estás segura de que quieres eliminar <b>{{ tipoLegal.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteTipoLegalDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteTipoLegal" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteTipoLegalesDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="tipoLegal"
          >¿Estás seguro de que deseas eliminar los Tipos Legales seleccionados?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteTipoLegalDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteSelectedTipoLegales"
        />
      </template>
    </Dialog>
  </div>
</template>
<style scoped lang="scss"></style>
