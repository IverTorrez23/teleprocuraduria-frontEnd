<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'

import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

import type { IPosta } from '../types/posta.types'
import postaService from '../services/posta.service'
import { useRoute } from 'vue-router'
import type { IPlantilla } from '../../Plantilla/types/plantilla.types'
import plantillaService from '../../Plantilla/services/plantilla.service'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'

const toast = useToast()
const dt = ref()
const route = useRoute()
const postas = ref<IPosta[]>([])
const plantilla = ref<IPlantilla[]>([])

const postaDialog = ref(false)
const deletePostaDialog = ref(false)
const deletePostasDialog = ref(false)
const idPlantilla = Number(route.params.idPlantilla)
const posta = ref<IPosta>({ nombre: '', plantilla_id: idPlantilla } as IPosta)

const selectedPostas = ref<IPosta[]>([])
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

const loadPostas = async (event?: DataTableSortEvent) => {
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
  const response = await postaService.getPostas(opciones, idPlantilla)

  postas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadPlantilla = async () => {
  const response = await plantillaService.listarPlantillaPorId(idPlantilla)
  if (response) {
    plantilla.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch plantilla',
      life: 3000
    })
  }
}

onMounted(() => {
  loadPostas()
  loadPlantilla()
})
watch(
  () => filters.value.global.value,
  () => {
    loadPostas()
  }
)

const getPlantillaName = computed(() => {
  const currentPlantilla = plantilla.value.find((p) => p.id === posta.value.plantilla_id)
  return currentPlantilla ? currentPlantilla.nombre : 'Unknown'
})

const openNew = () => {
  posta.value = { nombre: '', plantilla_id: idPlantilla } as IPosta
  submitted.value = false
  postaDialog.value = true
}

const hideDialog = () => {
  postaDialog.value = false
  submitted.value = false
}

const confirmDeletePosta = (pos: IPosta) => {
  posta.value = pos
  deletePostaDialog.value = true
}

const deletePosta = async () => {
  try {
    if (posta.value && posta.value.id) {
      await postaService.deletePosta(posta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Posta Deleted',
        life: 3000
      })
      deletePostaDialog.value = false
      loadPostas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete posta',
      life: 3000
    })
  }
}



const deleteSelectedPostas = () => {
  postas.value = postas.value.filter((val) => !selectedPostas.value.includes(val))
  deletePostasDialog.value = false
  selectedPostas.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Postas Deleted',
    life: 3000
  })
}

const savePosta = async () => {
  submitted.value = true
  if (!posta.value?.nombre) return

  try {
    if (posta.value.id) {
      await postaService.updatePosta(posta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Posta Updated',
        life: 3000
      })
    } else {
      await postaService.createPosta(posta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Posta Created',
        life: 3000
      })
    }

    hideDialog()
    loadPostas()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save posta',
      life: 3000
    })
  }
}

const lastPosta = computed(() => postas.value[postas.value.length - 1])
</script>

<template>
  <div class="card">
    <Toast />
    <div class="flex flex-wrap justify-content-start align-items-center">
      <DynamicBreadcrumb
        :home="{ label: 'Plantillas', route: '/Plantillas' }"
        :items="[{ label: getPlantillaName }]"
        class="flex-1"
      />
    </div>

    <Toolbar class="mb-4">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="postas"
      v-model:selection="selectedPostas"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} postas"
      :autoLayout="true"
      :lazy="true"
      @page="loadPostas"
      @sort="loadPostas"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Administrar Postas</h4>

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
 

      <Column field="numero_posta" header="Número Posta" sortable style="min-width: 6rem"></Column>
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
            <template v-if="slotProps.data.id === lastPosta.id">
              <Button
                v-tooltip.bottom="'Eliminar'"
                icon="pi pi-trash"
                rounded
                severity="danger"
                @click="confirmDeletePosta(slotProps.data)"
              />
            </template>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- create and edit modal -->
    <Dialog
      v-model:visible="postaDialog"
      :style="{ width: '450px' }"
      header="Posta"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="nombre">Nombre</label>
        <InputText
          id="nombre"
          v-model.trim="posta.nombre"
          required="true"
          autofocus
          :invalid="submitted && !posta.nombre"
        />
        <small class="p-error" v-if="submitted && !posta.nombre">Nombre es requerido.</small>
      </div>

      <div class="field">
        <label for="plantilla_id">Plantilla</label>
        <InputText id="plantilla_id" :value="getPlantillaName" disabled />
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="savePosta" />
      </template>
    </Dialog>

    <!-- dialog delete Posta -->
    <Dialog
      v-model:visible="deletePostaDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="posta"
          >¿Estás segura de que quieres eliminar <b>{{ posta.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deletePostaDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deletePosta" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deletePostasDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="posta">¿Estás seguro de que deseas eliminar las postas seleccionadas?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deletePostasDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteSelectedPostas"
        />
      </template>
    </Dialog>
  </div>
</template>
<style scoped lang="scss"></style>
