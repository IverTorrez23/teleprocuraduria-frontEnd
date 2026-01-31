<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable, { type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import type { IUsuario } from '../types/usuario.types'
import usuarioService from '../services/usuario.service'
import { FilterMatchMode } from 'primevue/api'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const toast = useToast()
const dt = ref()
const submitted = ref(false)
const abogadoDependienteDialog = ref(false)
const deleteAbogadoDependienteDialog = ref(false)
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

const loadAbogadoDependiente = async (event?: DataTableSortEvent) => {
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
  const response = await usuarioService.listarUsuariosAbogadosDependientes(
    usuarioSession.value?.id || 0,
    opciones
  )
  usuarios.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(loadAbogadoDependiente)

watch(
  () => filters.value.global.value,
  () => {
    loadAbogadoDependiente()
  }
)

const openNew = () => {
  usuario.value = Object.assign({}, { persona: {} }) as IUsuario
  submitted.value = false
  abogadoDependienteDialog.value = true
}

const hideDialog = () => {
  abogadoDependienteDialog.value = false
  submitted.value = false
}

const confirmDeleteSelected = () => {
  deleteAbogadoDependienteDialog.value = true
}

const editAbogadoDependiente = (usuarios: IUsuario) => {
  usuario.value = { ...usuarios }
  abogadoDependienteDialog.value = true
}
const confirmDeleteAbogadoDependiente = (usuarios: IUsuario) => {
  usuario.value = usuarios
  deleteAbogadoDependienteDialog.value = true
}
const saveUsuario = async () => {
  submitted.value = true

  usuario.value.name = usuario.value.persona.nombre
  usuario.value.tipo = 'ABOGADO_DEPENDIENTE'

  try {
    const response = usuario.value.id
      ? await usuarioService.updateUsuario(usuario.value)
      : await usuarioService.crearUsuario(usuario.value)

    if (response.status === 'error') {
      if (response.errors) {
        validationErrors.value = response.errors
      }
      showToast('error', 'Error', response.message)
    } else {
      showToast('success', 'Registro exitoso', response.message)
      resetUsuario()
      abogadoDependienteDialog.value = false
      await loadAbogadoDependiente()
    }
  } catch (error) {
    showToast('error', 'Error', 'No se pudo guardar el usuario')
  }
}

const deleteAbogadoDependiente = async () => {
  try {
    const response = await usuarioService.deleteUsuario(usuario.value.id)
    if (response.status === 'error') {
      showToast('error', 'Error', response.message)
    } else {
      showToast('success', 'Eliminado', response.message)
      deleteAbogadoDependienteDialog.value = false
      await loadAbogadoDependiente()
    }
  } catch (error) {
    showToast('error', 'Error', 'No se pudo eliminar el usuario')
  }
}

const showToast = (severity: 'success' | 'error', summary: string, detail: string) => {
  toast.add({
    severity,
    summary,
    detail,
    life: 3000
  })
}

const resetUsuario = () => {
  usuario.value = {
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
          :disabled="!selectedAbogadoDependiente || !selectedAbogadoDependiente.length"
        />
      </template>
    </Toolbar>

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
      @page="loadAbogadoDependiente"
      @sort="loadAbogadoDependiente"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Administrar Abogados</h4>

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
      <Column field="persona.nombre" header="Nombre" sortable style="min-width: 16rem"></Column>
      <Column
        field="persona.apellido"
        header="Apellidos"
        sortable
        style="min-width: 16rem"
      ></Column>
      <Column field="persona.telefono" header="Teléfono" style="min-width: 6rem"> </Column>
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
              v-tooltip.bottom="'Editar'"
              icon="pi pi-pencil"
              rounded
              severity="success"
              class="mr-1"
              @click="editAbogadoDependiente(slotProps.data)"
            />
            <Button
              v-tooltip.bottom="'Eliminar'"
              icon="pi pi-trash"
              rounded
              severity="danger"
              @click="confirmDeleteAbogadoDependiente(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- create and edit modal -->
    <Dialog
      v-model:visible="abogadoDependienteDialog"
      :style="{ width: '700px' }"
      header="Crear Usuario"
      :modal="true"
      class="p-fluid"
    >
      <!-- Sección: Datos Personales -->

      <div class="formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="nombre">Nombre</label>
          <InputText
            :class="{ 'p-invalid': validationErrors['persona.nombre'] }"
            id="nombre"
            v-model="usuario.persona.nombre"
          />
          <small class="p-error" v-if="validationErrors['persona.nombre']">{{
            validationErrors['persona.nombre'][0]
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="apellido">Apellido</label>
          <InputText
            :class="{ 'p-invalid': validationErrors['persona.apellido'] }"
            id="apellido"
            v-model="usuario.persona.apellido"
          />
          <small class="p-error" v-if="validationErrors['persona.apellido']">{{
            validationErrors['persona.apellido'][0]
          }}</small>
        </div>

        <div class="col-12 md:col-6 field">
          <label for="telefono">Teléfono</label>
          <PhoneInput id="telefono" v-model="usuario.persona.telefono" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="direccion">Dirección</label>
          <InputText
            :class="{ 'p-invalid': validationErrors['persona.direccion'] }"
            id="direccion"
            v-model="usuario.persona.direccion"
          />
          <small class="p-error" v-if="validationErrors['persona.direccion']">{{
            validationErrors['persona.direccion'][0]
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="email">Correo</label>
          <InputText
            :class="{ 'p-invalid': validationErrors['email'] }"
            id="email"
            v-model="usuario.email"
          />
          <small class="p-error" v-if="validationErrors['email']">{{
            validationErrors['email'][0]
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="password" class="font-medium text-900">Contraseña</label>
          <Password
            id="password"
            v-model="usuario.password"
            placeholder="********"
            promptLabel="Ingrese una contraseña"
            weakLabel="Débil"
            mediumLabel="Mediana"
            strongLabel="Fuerte"
            :toggleMask="true"
          />
        </div>

        <div class="field col-12">
          <label for="observacion">Observación</label>
          <Textarea
            :class="{ 'p-invalid': validationErrors['persona.observacion'] }"
            id="observacion"
            v-model="usuario.persona.observacion"
            rows="3"
          />
          <small class="p-error" v-if="validationErrors['persona.observacion']">{{
            validationErrors['persona.observacion'][0]
          }}</small>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="saveUsuario" />
      </template>
    </Dialog>

    <!-- delete modal -->
    <Dialog
      v-model:visible="deleteAbogadoDependienteDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="usuario"
          >¿Estás segura de que quieres eliminar a <b>{{ usuario.persona.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteAbogadoDependienteDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteAbogadoDependiente"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
