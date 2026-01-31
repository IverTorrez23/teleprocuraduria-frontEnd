<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { ITipoPosta } from '../types/tipoPosta.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import tipoPostaService from '../service/tipoPosta.service'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'

const toast = useToast()
const dt = ref()
const tipoPostas = ref<ITipoPosta[]>([])
const tipoPostaDialog = ref(false)
const deleteTipoPostaDialog = ref(false)
const tipoPosta = ref<ITipoPosta>({
  id: 0,
  nombre: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

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

const loadTipoPostas = async (event?: DataTableSortEvent) => {
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
  const response = await tipoPostaService.getTipoPostas(opciones)

  tipoPostas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadTipoPostas()
})
watch(
  () => filters.value.global.value,
  () => {
    loadTipoPostas()
  }
)
const openNew = () => {
  tipoPosta.value = {} as ITipoPosta
  submitted.value = false
  tipoPostaDialog.value = true
}

const hideDialog = () => {
  tipoPostaDialog.value = false
  submitted.value = false
}

const editTipoPosta = (tp: ITipoPosta) => {
  tipoPosta.value = { ...tp }
  tipoPostaDialog.value = true
}

const confirmDeleteTipoPosta = (tp: ITipoPosta) => {
  tipoPosta.value = tp
  deleteTipoPostaDialog.value = true
}

const deleteTipoPosta = async () => {
  try {
    if (tipoPosta.value && tipoPosta.value.id) {
      await tipoPostaService.deleteTipoPosta(tipoPosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tipo posta Deleted',
        life: 3000
      })
      deleteTipoPostaDialog.value = false
      loadTipoPostas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete tipo posta',
      life: 3000
    })
  }
}

const saveTipoPosta = async () => {
  submitted.value = true
  if (!tipoPosta.value?.nombre) return

  try {
    if (tipoPosta.value.id) {
      await tipoPostaService.updateTipoPosta(tipoPosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Tipo posta Updated',
        life: 3000
      })
    } else {
      await tipoPostaService.createTipoPosta(tipoPosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'tipo posta Created',
        life: 3000
      })
    }
    hideDialog()
    loadTipoPostas()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save tipo posta',
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
        <div class="flex flex-wrap justify-content-start align-items-center">
          <DynamicBreadcrumb :home="{ label: 'Plantillas', route: '/Plantillas' }" :items="[{ label: 'Tipo Posta' }]" class="flex-1" />
        </div>
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
          :value="tipoPostas"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipo postas"
          :autoLayout="true"
          :lazy="true"
          @page="loadTipoPostas"
          @sort="loadTipoPostas"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Tipo Postas</h4>
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
                @click="editTipoPosta(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteTipoPosta(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="tipoPostaDialog"
          :style="{ width: '450px' }"
          header="Tipo Posta"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="tipoPosta.nombre"
              required="true"
              autofocus
              :invalid="submitted && !tipoPosta.nombre"
            />
            <small class="p-error" v-if="submitted && !tipoPosta.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveTipoPosta" />
          </template>
        </Dialog>

        <!-- dialog delete -->
        <Dialog
          v-model:visible="deleteTipoPostaDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="tipoPosta"
              >¿Estás segura de que quieres eliminar <b>{{ tipoPosta.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteTipoPostaDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteTipoPosta" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
