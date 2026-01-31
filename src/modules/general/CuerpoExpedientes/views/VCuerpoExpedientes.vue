<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import type { ICuerpoExpediente } from '../types/cuerpo-expediente.types'
import cuerpoExpedienteService from '../services/cuerpo-expediente.service'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize } from '@/constants/constants'
import type { ITribunal } from '../../Tribunal/types/tribunal.types'
import tribunalService from '../../Tribunal/services/tribunal.service'

const route = useRoute()
const idTribunal = Number(route.params.id) //Desde la Url

const toast = useToast()
const dt = ref()
const cuerpoExpedientes = ref<ICuerpoExpediente[]>([])
const cuerpoExpedienteDialog = ref(false)
const deleteCuerpoExpedienteDialog = ref(false)
const deleteCuerpoExpedientesDialog = ref(false)
const cuerpoExpediente = ref<ICuerpoExpediente>({
  id: 0,
  nombre: '',
  link_cuerpo: '',
  tribunal_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const selectedCuerpoExpedientes = ref<ICuerpoExpediente[]>([])
let selectedFile: any = null
const visibleUploadFIle = ref(false)
const visibleInputLink = ref(false)
const opcionCarga = ref('')
const tribunalSelected = ref<ITribunal | null>(null)

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

const loadCuerpoExpedientes = async (event?: DataTableSortEvent) => {
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
  const response = await cuerpoExpedienteService.getCuerpoExpediente(opciones, idTribunal)

  cuerpoExpedientes.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadUnTribunal = async () => {
  const response = await tribunalService.obtenerUnTribunal(idTribunal)
  if (response) {
    tribunalSelected.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener una Tribunal',
      life: 3000
    })
  }
}
onMounted(() => {
  loadCuerpoExpedientes()
  loadUnTribunal()
})
watch(
  () => filters.value.global.value,
  () => {
    loadCuerpoExpedientes()
  }
)
const openNew = () => {
  cuerpoExpediente.value = {} as ICuerpoExpediente
  submitted.value = false
  cuerpoExpedienteDialog.value = true
  opcionCarga.value = ''
  selectedFile = null
  visibleUploadFIle.value = false
  visibleInputLink.value = false
}

const hideDialog = () => {
  cuerpoExpedienteDialog.value = false
  submitted.value = false
}

const editCuerpoExpediente = (cuExp: ICuerpoExpediente) => {
  cuerpoExpediente.value = { ...cuExp }
  cuerpoExpedienteDialog.value = true
  opcionCarga.value = ''
  selectedFile = null
  visibleUploadFIle.value = false
  visibleInputLink.value = false
}

const confirmDeleteCuerpoExpediente = (cuExp: ICuerpoExpediente) => {
  cuerpoExpediente.value = cuExp
  deleteCuerpoExpedienteDialog.value = true
}

const deleteCuerpoExpediente = async () => {
  try {
    if (cuerpoExpediente.value && cuerpoExpediente.value.id) {
      await cuerpoExpedienteService.deleteCuerpoExpediente(cuerpoExpediente.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Expediente digital Deleted',
        life: 3000
      })
      deleteCuerpoExpedienteDialog.value = false
      loadCuerpoExpedientes()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Expediente digital',
      life: 3000
    })
  }
}

const deleteSelectedCuerposExpedientes = () => {
  cuerpoExpedientes.value = cuerpoExpedientes.value.filter(
    (val) => !selectedCuerpoExpedientes.value.includes(val)
  )
  deleteCuerpoExpedientesDialog.value = false
  selectedCuerpoExpedientes.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Expediente digitales Deleted',
    life: 3000
  })
}

const saveCuerpoExpediente = async () => {
  submitted.value = true
  if (!cuerpoExpediente.value?.nombre) return
  const formData = new FormData()
  if (selectedFile) {
    formData.append('link_cuerpo', selectedFile)
  } else {
    formData.append('link_cuerpo', cuerpoExpediente.value.link_cuerpo)
  }
  formData.append('nombre', cuerpoExpediente.value.nombre.toString())
  formData.append('tribunal_id', idTribunal.toString())
  try {
    if (cuerpoExpediente.value.id) {
      formData.append('id', cuerpoExpediente.value.id.toString())
      await cuerpoExpedienteService.updateCuerpoExpediente(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Expediente digital Updated',
        life: 3000
      })
    } else {
      console.log('formData', formData)
      console.log('cuerpoExpediente.value?.link_cuerpo', cuerpoExpediente.value?.link_cuerpo)
      /*if (!cuerpoExpediente.value?.link_cuerpo) {
        toast.add({
        severity: 'secondary',
        summary: 'Error',
        detail: 'Debe subir el expediente digital o pegar un link del expediente',
        life: 6000
      })

      return
      }*/
      await cuerpoExpedienteService.createCuerpoExpediente(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Expediente digital Created',
        life: 3000
      })
    }
    hideDialog()
    loadCuerpoExpedientes()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Expediente digital',
      life: 3000
    })
  }
}

const onFileSelect = (event: any) => {
  selectedFile = event.files[0]
}
const onRadioChange = async (newValue: string) => {
  if (newValue === 'file') {
    visibleUploadFIle.value = true
    visibleInputLink.value = false
  } else {
    if (newValue === 'link') {
      visibleUploadFIle.value = false
      visibleInputLink.value = true
    }
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
        <!-- Tabla del Tribunal -->
        <DataTable
          ref="dt2"
          dataKey="id"
          :value="[tribunalSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="codigo" header="Fisiologia Tribunal">
            <template #body="">
              <span class="p-column-title">Fisiologia Tribunal</span>
              {{ tribunalSelected?.clase_tribunal?.nombre }}
            </template></Column
          >
          <Column field="nombre" header="Nombre Tribunal">
            <template #body="">
              <span class="p-column-title">Nombre Tribunal</span>
              {{ tribunalSelected?.juzgado?.nombre_numerico }}°
              {{ tribunalSelected?.juzgado?.jerarquia }}
              {{ tribunalSelected?.juzgado?.materia_juzgado }}
              {{ tribunalSelected?.juzgado?.distrito?.abreviatura }}
            </template></Column
          >
          <Column field="abogado" header="# De Exp.">
            <template #body="">
              <span class="p-column-title"># De Exp.</span>
              {{ tribunalSelected?.expediente }}
            </template></Column
          >
          <Column field="procurador" header="Código Juridico">
            <template #body="">
              <span class="p-column-title">Código Juridico</span>
              {{ tribunalSelected?.codnurejianuj }}
            </template></Column
          >
        </DataTable>
      <br>

        <DataTable
          ref="dt"
          :value="cuerpoExpedientes"
          v-model:selection="selectedCuerpoExpedientes"
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
          @page="loadCuerpoExpedientes"
          @sort="loadCuerpoExpedientes"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Expediente Digital</h4>
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
                style="width: 30px; height: 30px"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editCuerpoExpediente(slotProps.data)"
              />
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mr-2"
                @click="confirmDeleteCuerpoExpediente(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="cuerpoExpedienteDialog"
          :style="{ width: '450px' }"
          header="Expedeinte Digital"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="cuerpoExpediente.nombre"
              required="true"
              autofocus
              autocomplete="off"
              :invalid="submitted && !cuerpoExpediente.nombre"
            />
            <small class="p-error" v-if="submitted && !cuerpoExpediente.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <div class="flex flex-wrap gap-3">
            <div class="flex align-items-center">
              <RadioButton
                v-model="opcionCarga"
                inputId="fileUpload"
                name="cuerpo"
                value="upload"
                @change="onRadioChange('file')"
              />
              <label for="Archivo" class="ml-2">Subir Archivo</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                v-model="opcionCarga"
                inputId="textLink"
                name="cuerpo"
                value="link"
                @change="onRadioChange('link')"
              />
              <label for="Link" class="ml-2">Pegar Link</label>
            </div>
          </div>

          <div v-if="visibleUploadFIle" class="field">
            <label for="link_cuerpo">Archivo</label>
            <Toast />
            <FileUpload
              id="link_cuerpo"
              v-model.trim="cuerpoExpediente.link_cuerpo"
              mode="advanced"
              name="link_cuerpo"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !cuerpoExpediente?.link_cuerpo"
              @select="onFileSelect($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !cuerpoExpediente?.link_cuerpo"
              >Archivo es requerido.</small
            >
          </div>

          <div v-if="visibleInputLink" class="field">
            <label for="link_cuerpo">Link</label>
            <InputText
              id="link_cuerpo"
              v-model.trim="cuerpoExpediente.link_cuerpo"
              required="true"
              autofocus
              autocomplete="off"
              :invalid="submitted && !cuerpoExpediente.link_cuerpo"
            />
            <small class="p-error" v-if="submitted && !cuerpoExpediente.link_cuerpo"
              >Link es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveCuerpoExpediente"
            />
          </template>
        </Dialog>

        <!-- dialog delete -->
        <Dialog
          v-model:visible="deleteCuerpoExpedienteDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="cuerpoExpediente"
              >¿Estás segura de que quieres eliminar <b>{{ cuerpoExpediente.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteCuerpoExpedienteDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteCuerpoExpediente"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteCuerpoExpedientesDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="cuerpoExpediente"
              >¿Estás seguro de que deseas eliminar los registros seleccionados?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteCuerpoExpedientesDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedCuerposExpedientes"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
