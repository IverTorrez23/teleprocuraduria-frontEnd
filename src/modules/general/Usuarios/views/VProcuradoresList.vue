<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable, { type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import type { IPersona, IUsuario } from '../types/usuario.types'
import usuarioService from '../services/usuario.service'
import { FilterMatchMode } from 'primevue/api'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const toast = useToast()
const dt = ref()

const selectedAbogadoDependiente = ref<IUsuario[]>([])
const usuarios = ref<IUsuario[]>([])
const authStore = useAuthStore()
const { usuario: usuarioSession } = storeToRefs(authStore)

const validationErrors = ref<Record<string, string[]>>({})

const usuario = ref<IUsuario>({
  name: '',
  email: '',
  password: '',
  tipo: '',
  abogado_id: 0,
  persona: {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    observacion: ''
  }
} as IUsuario)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const pagination = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})

const loadProcuradoresList = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['name'], keyword: filters.value.global.value }]
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
  const response = await usuarioService.listarProcuradoresPaginado(
   opciones
  )
  usuarios.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(loadProcuradoresList)

watch(
  () => filters.value.global.value,
  () => {
    loadProcuradoresList()
  }
)

const showToast = (severity: 'success' | 'error', summary: string, detail: string) => {
  toast.add({
    severity,
    summary,
    detail,
    life: 3000
  })
}

</script>

<template>
  <div class="card">
    <Toast />
    
    <DataTable
      ref="dt"
      :value="usuarios"
      v-model:selection="selectedAbogadoDependiente"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
      :autoLayout="true"
      :lazy="true"
      @page="loadProcuradoresList"
      @sort="loadProcuradoresList"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Procuradores</h4>

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

      
      <Column field="persona.nombre" header="Nombre"  style="min-width: 16rem"></Column>
      <Column
        field="persona.apellido"
        header="Apellidos"
        style="min-width: 16rem"
      ></Column>
      <Column field="email" header="Correo" style="min-width: 6rem"> </Column>
      <Column field="persona.telefono" header="Teléfono" style="min-width: 6rem"> </Column>
      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado"
            :severity="getEstado(slotProps.data.estado)"
          /> </template
      ></Column>
      
    </DataTable>

  </div>
</template>

<style scoped></style>
