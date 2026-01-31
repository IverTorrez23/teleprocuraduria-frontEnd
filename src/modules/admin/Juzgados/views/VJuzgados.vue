<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import JuzgadoService from '../services/juzgado.service'
import type { IJuzgado } from '../types/juzgado.types'
import type {
  IDataTableSortEvent,
  IOpcionesPaginado,
  IPaginado,
  ISearch,
  ISort
} from '@/common/common.types'

import DistritoService from '../../Distritos/services/distrito.service'
import type { IDistrito } from '../../Distritos/types/distrito.types'
import PisoService from '../../Piso/services/piso.service'
import type { IPiso } from '../../Piso/types/piso.types'
import { getEstado } from '@/common/utils/statusUtils'
import { baseUrlResource } from '@/config/constants'
import OVisorImg from '@/components/OVisorImg.vue'

const toast = useToast()
const dt = ref()
const juzgados = ref<IJuzgado[]>([])
const juzgadoDialog = ref(false)
const deleteJuzgadoDialog = ref(false)
const deleteJuzgadosDialog = ref(false)
//const juzgado = ref<IJuzgado | null>(null)
const juzgado = ref<IJuzgado>({
  id: 0,
  nombre_numerico: 0,
  jerarquia: '',
  materia_juzgado: '',
  coordenadas: '',
  foto_url: '',
  contacto1: '',
  contacto2: '',
  contacto3: '',
  contacto4: '',
  distrito_id: 0,
  piso_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedJuzgados = ref<IJuzgado[]>([])

const distritos = ref<IDistrito[]>([])
const pisos = ref<IPiso[]>([])
let selectedFile: any = null
const selectedImageUrl = ref('')
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
//Opciones iniciales para el listado de juzgados
const initialOptions = {
  page: pagination.value.currentPage,
  perPage: pagination.value.rowsPerPage,
  search: filters.value.global.value
    ? [{ fields: ['nombre_numerico', 'jerarquia'], keyword: filters.value.global.value }]
    : [],
  sort: []
}

const loadJuzgados = async (opciones: any) => {
  const response = await JuzgadoService.getJuzgados(opciones)
  juzgados.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}
// Función para manejar eventos de paginación
const onPage = async (event: any) => {
  const opciones = {
    page: event.first / event.rows + 1,
    perPage: event.rows,
    search: filters.value.global.value
      ? [{ fields: ['nombre_numerico', 'jerarquia'], keyword: filters.value.global.value }]
      : [],
    sort: []
  }
  await loadJuzgados(opciones)
}
// Función para manejar eventos de ordenación
const onSort = async (event: any) => {
  const opciones = {
    page: pagination.value.currentPage,
    perPage: pagination.value.rowsPerPage,
    search: filters.value.global.value
      ? [{ fields: ['nombre_numerico', 'jerarquia'], keyword: filters.value.global.value }]
      : [],
    sort: event.sortField
      ? [{ field: event.sortField, orderType: event.sortOrder === 1 ? 'ASC' : 'DESC' }]
      : []
  }
  await loadJuzgados(opciones)
}

const loadDistritos = async () => {
  const response = await DistritoService.listarDistritos()
  if (response) {
    distritos.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch distritos',
      life: 3000
    })
  }
}
const loadPisos = async () => {
  const response = await PisoService.listarPisos()
  if (response) {
    pisos.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch pisos',
      life: 3000
    })
  }
}

onMounted(async () => {
  await loadJuzgados(initialOptions)
  await loadDistritos()
  await loadPisos()
})

watch(
  () => filters.value.global.value,
  async () => {
    const search = filters.value.global.value
      ? [{ fields: ['nombre_numerico', 'jerarquia'], keyword: filters.value.global.value }]
      : []

    const opciones = {
      page: pagination.value.currentPage,
      perPage: pagination.value.rowsPerPage,
      search: search,
      sort: []
    }

    await loadJuzgados(opciones)
  }
)

const openNew = () => {
  juzgado.value = {} as IJuzgado
  submitted.value = false
  juzgadoDialog.value = true
}

const hideDialog = () => {
  juzgadoDialog.value = false
  submitted.value = false
}

const editJuzgado = (juz: IJuzgado) => {
  juzgado.value = { ...juz }
  juzgadoDialog.value = true
}

const confirmDeleteJuzgado = (juz: IJuzgado) => {
  juzgado.value = juz
  deleteJuzgadoDialog.value = true
}

const deleteJuzgado = async () => {
  try {
    if (juzgado.value && juzgado.value.id) {
      await JuzgadoService.deleteJuzgado(juzgado.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Juzgado Deleted',
        life: 3000
      })
      deleteJuzgadoDialog.value = false
      loadJuzgados(initialOptions)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete juzgado',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteJuzgadosDialog.value = true
}

const deleteSelectedJuzgados = () => {
  juzgados.value = juzgados.value.filter((val) => !selectedJuzgados.value.includes(val))
  deleteJuzgadosDialog.value = false
  selectedJuzgados.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected juzgados Deleted',
    life: 3000
  })
}

const onFileSelect = (event: any) => {
  selectedFile = event.files[0]
}
const saveJuzgado = async () => {
  submitted.value = true
  if (!juzgado.value?.nombre_numerico || !juzgado.value?.distrito_id || !juzgado.value?.piso_id)
    return
  const formData = new FormData()
  if (selectedFile) {
    formData.append('foto_url', selectedFile)
  }
  formData.append('nombre_numerico', juzgado.value.nombre_numerico.toString())
  formData.append('jerarquia', juzgado.value.jerarquia.toString())
  formData.append('materia_juzgado', juzgado.value.materia_juzgado.toString())
  formData.append('coordenadas', juzgado.value.coordenadas.toString())
  formData.append('contacto1', juzgado.value.contacto1.toString())
  formData.append('contacto2', juzgado.value.contacto2.toString())
  formData.append('contacto3', juzgado.value.contacto3.toString())
  formData.append('contacto4', juzgado.value.contacto4.toString())
  formData.append('distrito_id', juzgado.value.distrito_id.toString())
  formData.append('piso_id', juzgado.value.piso_id.toString())
  try {
    if (juzgado.value.id) {
      formData.append('id', juzgado.value.id.toString())
      await JuzgadoService.updateJuzgado(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Juzgado Updated',
        life: 3000
      })
    } else {
      await JuzgadoService.createJuzgado(formData)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Juzgado Created',
        life: 3000
      })
    }
    hideDialog()
    loadJuzgados(initialOptions)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
  }
}

const showImageDialog = ref(false)

const showImage = (url: string) => {
  selectedImageUrl.value = `${baseUrlResource}/${url}`
  showImageDialog.value = true
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
                :disabled="!selectedJuzgados || !selectedJuzgados.length"
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
            <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV()" />
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="juzgados"
          v-model:selection="selectedJuzgados"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} juzgados"
          :autoLayout="true"
          :lazy="true"
          @page="onPage"
          @sort="onSort"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Juzgados</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
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
          <Column field="nombre_numerico" header="Nombre númerico" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Nombre númerico</span>
              {{ slotProps.data.nombre_numerico }}
            </template></Column
          >
          <Column field="jerarquia" header="Jerarquia" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Jerarquia</span>
              {{ slotProps.data.jerarquia }}
            </template></Column
          >
          <Column field="materia_juzgado" header="Materia Juzgado" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Materia Juzgado</span>
              {{ slotProps.data.materia_juzgado }}
            </template></Column
          >
          <Column field="coordenadas" header="Coordenadas" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Coordenadas</span>
              {{ slotProps.data.coordenadas }}
            </template></Column
          >
          <Column field="foto_url" header="Foto" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Foto</span>
              <Button @click="showImage(slotProps.data.foto_url)">
                <i class="pi pi-image"></i>
              </Button> </template
          ></Column>
          <Column field="contacto1" header="Contacto 1" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Contacto 1</span>
              {{ slotProps.data.contacto1 }}
            </template></Column
          >
          <Column field="contacto2" header="Contacto 2" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Contacto 2</span>
              {{ slotProps.data.contacto2 }}
            </template></Column
          >
          <Column field="contacto3" header="Contacto 3" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Contacto 3</span>
              {{ slotProps.data.contacto3 }}
            </template></Column
          >
          <Column field="contacto4" header="Contacto 4" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Contacto 4</span>
              {{ slotProps.data.contacto4 }}
            </template></Column
          >
          <Column field="distrito_id" header="Distrito" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Distrito</span>
              {{ slotProps.data.distrito.nombre }}
            </template></Column
          >
          <Column field="piso_id" header="Piso" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Piso</span>
              {{ slotProps.data.piso.nombre }}
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
                @click="editJuzgado(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteJuzgado(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="juzgadoDialog"
          :style="{ width: '450px' }"
          header="Juzgado"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre númerico</label>
            <InputNumber
              id="nombre_numerico"
              v-model.trim="juzgado.nombre_numerico"
              required="true"
              autofocus
              :useGrouping="false"
              fluid
              :invalid="submitted && !juzgado.nombre_numerico"
            />
            <small class="p-error" v-if="submitted && !juzgado.nombre_numerico"
              >Nombre es requerido.</small
            >
          </div>
          <div class="field">
            <label for="jerarquia">Jerarquia</label>
            <InputText
              id="jerarquia"
              v-model.trim="juzgado.jerarquia"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.jerarquia"
            />
            <small class="p-error" v-if="submitted && !juzgado?.jerarquia"
              >Jerarquia es requerido.</small
            >
          </div>

          <div class="field">
            <label for="materia_juzgado">Materia Juzgado</label>
            <InputText
              id="materia_juzgado"
              v-model.trim="juzgado.materia_juzgado"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.materia_juzgado"
            />
            <small class="p-error" v-if="submitted && !juzgado?.materia_juzgado"
              >Materia juzgado es requerido.</small
            >
          </div>

          <div class="field">
            <label for="coordenadas">Coordenadas</label>
            <InputText
              id="coordenadas"
              v-model.trim="juzgado.coordenadas"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.coordenadas"
            />
            <small class="p-error" v-if="submitted && !juzgado?.coordenadas"
              >coordenadas es requerido.</small
            >
          </div>

          <div class="field">
            <label for="foto_url">Foto</label>
            <Toast />
            <FileUpload
              id="foto_url"
              v-model.trim="juzgado.foto_url"
              mode="advanced"
              name="foto_url"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="image/*"
              :multiple="false"
              :invalid="submitted && !juzgado?.foto_url"
              @select="onFileSelect($event)"
            >
              <template #empty>
                <span>Arrastre y suelte archivos aquí para cargarlos.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !juzgado?.foto_url">Foto es requerido.</small>
          </div>

          <div class="field">
            <label for="contacto1">Contacto 1</label>
            <InputText
              id="contacto1"
              v-model.trim="juzgado.contacto1"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.contacto1"
            />
            <small class="p-error" v-if="submitted && !juzgado?.contacto1"
              >Contacto 1 es requerido.</small
            >
          </div>

          <div class="field">
            <label for="contacto2">Contacto 2</label>
            <InputText
              id="contacto2"
              v-model.trim="juzgado.contacto2"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.contacto2"
            />
            <small class="p-error" v-if="submitted && !juzgado?.contacto3"
              >Contacto 3 es requerido.</small
            >
          </div>

          <div class="field">
            <label for="contacto3">Contacto 3</label>
            <InputText
              id="contacto3"
              v-model.trim="juzgado.contacto3"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.contacto3"
            />
            <small class="p-error" v-if="submitted && !juzgado?.contacto3"
              >Contacto 3 es requerido.</small
            >
          </div>

          <div class="field">
            <label for="contacto4">Contacto 4</label>
            <InputText
              id="contacto4"
              v-model.trim="juzgado.contacto4"
              required="true"
              autofocus
              :invalid="submitted && !juzgado?.contacto4"
            />
            <small class="p-error" v-if="submitted && !juzgado?.contacto4"
              >Contacto 4 es requerido.</small
            >
          </div>

          <div class="field">
            <label for="distrito_id">Distrito</label>
            <Dropdown
              id="distrito_id"
              v-model="juzgado.distrito_id"
              :options="distritos"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar Distrito"
              :invalid="submitted && !juzgado?.distrito_id"
            />
            <small class="p-error" v-if="submitted && !juzgado?.distrito_id"
              >Distrito es requerido.</small
            >
          </div>

          <div class="field">
            <label for="piso_id">Piso</label>
            <Dropdown
              id="piso_id"
              v-model="juzgado.piso_id"
              :options="pisos"
              optionLabel="nombre"
              optionValue="id"
              filter
              filterPlaceholder="Buscar piso"
              :invalid="submitted && !juzgado?.piso_id"
            />
            <small class="p-error" v-if="submitted && !juzgado?.piso_id">Piso es requerido.</small>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveJuzgado" />
          </template>
        </Dialog>

        <!-- dialog delete juzgado -->
        <Dialog
          v-model:visible="deleteJuzgadoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="juzgado"
              >¿Estás segura de que quieres eliminar el juzgado número
              <b>{{ juzgado.nombre_numerico }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteJuzgadoDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteJuzgado" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteJuzgadosDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="juzgado"
              >¿Estás seguro de que deseas eliminar los juzgados seleccionados?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteJuzgadosDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedJuzgados"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
  <OVisorImg
    :imageUrl="selectedImageUrl"
    :visible="showImageDialog"
    @update:visible="showImageDialog = $event"
    header="Vista de Imagen"
  />
</template>
<style scoped></style>
