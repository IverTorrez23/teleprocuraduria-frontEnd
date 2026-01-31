<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { IPlantilla } from '../types/plantilla.types'
import plantillaService from '../services/plantilla.service'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

const router = useRouter()
const toast = useToast()
const dt = ref()
const plantillas = ref<IPlantilla[]>([])
const plantillaDialog = ref(false)
const deletePlantillaDialog = ref(false)
const deletePlantillasDialog = ref(false)
const plantilla = ref<IPlantilla>({ nombre: '' } as IPlantilla)

const selectedPlantillas = ref<IPlantilla[]>([])
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

const loadPlantillas = async (event?: DataTableSortEvent) => {
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
  const response = await plantillaService.getPlantillas(opciones)

  plantillas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadPlantillas()
})
watch(
  () => filters.value.global.value,
  () => {
    loadPlantillas()
  }
)
const openNew = () => {
  plantilla.value = {} as IPlantilla
  submitted.value = false
  plantillaDialog.value = true
}

const hideDialog = () => {
  plantillaDialog.value = false
  submitted.value = false
}

const editPlantilla = (plant: IPlantilla) => {
  plantilla.value = { ...plant }
  plantillaDialog.value = true
}

const confirmDeletePlantilla = (plant: IPlantilla) => {
  plantilla.value = plant
  deletePlantillaDialog.value = true
}

const deletePlantilla = async () => {
  try {
    if (plantilla.value && plantilla.value.id) {
      await plantillaService.deletePlantilla(plantilla.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Plantilla Deleted',
        life: 3000
      })
      deletePlantillaDialog.value = false
      loadPlantillas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete plantilla',
      life: 3000
    })
  }
}



const deleteSelectedPlantillas = () => {
  plantillas.value = plantillas.value.filter((val) => !selectedPlantillas.value.includes(val))
  deletePlantillasDialog.value = false
  selectedPlantillas.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Plantillas Deleted',
    life: 3000
  })
}

const savePlantilla = async () => {
  submitted.value = true
  if (!plantilla.value?.nombre) return

  try {
    if (plantilla.value.id) {
      await plantillaService.updatePlantilla(plantilla.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Plantilla Updated',
        life: 3000
      })
    } else {
      await plantillaService.createPlantilla(plantilla.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Plantilla Created',
        life: 3000
      })
    }
    hideDialog()
    loadPlantillas()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save plantilla',
      life: 3000
    })
  }
}
const goToTipoPostas = () => {
  router.push('/tipo-posta')
}
</script>

<template>
  <div class="card">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        <Button label="Tipo posta" icon="pi pi-tag" severity="info" @click="goToTipoPostas" />
      </template>
    </Toolbar>
    <DataTable
      ref="dt"
      :value="plantillas"
      v-model:selection="selectedPlantillas"
      dataKey="id"
      :paginator="true"
      class="p-datatable-sm"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} plantillas"
      :autoLayout="true"
      :lazy="true"
      @page="loadPlantillas"
      @sort="loadPlantillas"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Administrar Plantillas</h4>

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

      

      <Column field="id" header="ID" sortable style="min-width: 3rem"></Column>
      <Column field="nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado"
            :severity="getEstado(slotProps.data.estado)"
          /> </template
      ></Column>

      <Column
        header="Acciones"
        style="min-width: 8rem"
        headerClass="flex justify-content-center align-items-center"
      >
        <template #body="slotProps">
          <div class="flex justify-content-center align-items-center gap-2">
            <Button
              v-tooltip.bottom="'Nueva Posta'"
              icon="pi pi-plus"
              severity="warning"
              rounded
              class="mr-1"
              @click="$router.push('/Plantillas/' + slotProps.data.id + '/Posta')"
            />
            <Button
              v-tooltip.bottom="'Editar'"
              icon="pi pi-pencil"
              rounded
              severity="success"
              class="mr-1"
              @click="editPlantilla(slotProps.data)"
            />
            <Button
              v-tooltip.bottom="'Eliminar'"
              icon="pi pi-trash"
              rounded
              severity="danger"
              @click="confirmDeletePlantilla(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- create and edit modal -->
    <Dialog
      v-model:visible="plantillaDialog"
      :style="{ width: '450px' }"
      header="Plantilla"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="nombre">Nombre</label>
        <InputText
          id="nombre"
          v-model.trim="plantilla.nombre"
          required="true"
          autofocus
          :invalid="submitted && !plantilla.nombre"
        />
        <small class="p-error" v-if="submitted && !plantilla.nombre">Nombre es requerido.</small>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="savePlantilla" />
      </template>
    </Dialog>

    <!-- dialog delete Plantilla -->
    <Dialog
      v-model:visible="deletePlantillaDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="plantilla"
          >¿Estás segura de que quieres eliminar <b>{{ plantilla.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deletePlantillaDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePlantilla" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deletePlantillasDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="plantilla"
          >¿Estás seguro de que deseas eliminar las plantillas seleccionadas?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deletePlantillasDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteSelectedPlantillas"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss"></style>
