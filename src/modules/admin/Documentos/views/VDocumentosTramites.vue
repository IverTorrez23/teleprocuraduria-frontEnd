<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import documentoCategoriaService from '../../DocumentosCategorias/services/documentoCategoria.service'
import documentoService from '../services/documento.service'
import type { IDocumento } from '../types/documento.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { ITreeNode } from '../../DocumentosCategorias/types/treeNode.types'
import { TipoDocumento } from '@/constants/constants'
import OPDFViewer from '@/common/visorPdf/OPDFViewer.vue'
import { baseUrlResource } from '@/config/constants'

const toast = useToast()
const dt = ref()
const documentos = ref<IDocumento[]>([])
const documentoDialog = ref(false)
const deleteDocumentoDialog = ref(false)
const deleteDocumentosDialog = ref(false)
const documento = ref<IDocumento>({
  id: 0,
  nombre: '',
  archivo_url: '',
  tipo: '',
  categoria_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const treeNodes = ref<ITreeNode[]>([])
const visibleDialoPdf = ref(false)
const pdfUrl = ref('')
let selectedFile: any = null
const selectedDocumentos = ref<IDocumento[]>([])
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

const loadDocumentos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombre', 'tipo'], keyword: filters.value.global.value }]
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
  const response = await documentoService.getDocumentosTramites(opciones)

  documentos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadSoloCategorias = async () => {
  const response = await documentoCategoriaService.listarSoloCategoriasTramites()
  if (response) {
    const categorias = await Promise.all(
      response.map(async (categoria) => {
        const subcategorias = await documentoCategoriaService.listarSubCategorias(categoria.id)

        return {
          id: categoria.id.toString(),
          label: categoria.nombre,
          children: subcategorias
            ? await Promise.all(
                subcategorias.map(async (sub) => {
                  const subSubcategorias2 = await documentoCategoriaService.listarSubCategorias(
                    sub.id
                  )

                  return {
                    id: sub.id.toString(),
                    label: sub.nombre,
                    children: subSubcategorias2
                      ? await Promise.all(
                          subSubcategorias2.map(async (sub2) => {
                            const subSubcategorias3 =
                              await documentoCategoriaService.listarSubCategorias(sub2.id)
                            return {
                              id: sub2.id.toString(),
                              label: sub2.nombre,
                              children: subSubcategorias3
                                ? await Promise.all(
                                    subSubcategorias3.map(async (sub3) => {
                                      const subSubcategorias4 =
                                        await documentoCategoriaService.listarSubCategorias(sub3.id)
                                      return {
                                        id: sub3.id.toString(),
                                        label: sub3.nombre,
                                        children: subSubcategorias4
                                          ? subSubcategorias4.map((subSub4) => ({
                                              id: subSub4.id.toString(),
                                              label: subSub4.nombre,
                                              children: [] as ITreeNode[] // Asegurar que los children son de tipo ITreeNode[]
                                            }))
                                          : []
                                      } as ITreeNode
                                    })
                                  )
                                : []
                            } as ITreeNode
                          })
                        )
                      : []
                  } as ITreeNode
                })
              )
            : []
        } as ITreeNode
      })
    )

    // Asignar las categorías al treeNodes
    treeNodes.value = categorias
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Solo categorias',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDocumentos()
  loadSoloCategorias()
})
watch(
  () => filters.value.global.value,
  () => {
    loadDocumentos()
  }
)
const openNew = () => {
  documento.value = {} as IDocumento
  submitted.value = false
  documentoDialog.value = true
}

const hideDialog = () => {
  documentoDialog.value = false
  submitted.value = false
}

const editDocumento = (doc: IDocumento) => {
  documento.value = { ...doc }
  documentoDialog.value = true
}

const confirmDeleteDocumento = (doc: IDocumento) => {
  documento.value = doc
  deleteDocumentoDialog.value = true
}

const deleteDocumento = async () => {
  try {
    if (documento.value && documento.value.id) {
      await documentoService.deleteDocumento(documento.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Deleted',
        life: 3000
      })
      deleteDocumentoDialog.value = false
      loadDocumentos()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Documento',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteDocumentosDialog.value = true
}

const deleteSelectedDocumentos = () => {
  documentos.value = documentos.value.filter((val) => !selectedDocumentos.value.includes(val))
  deleteDocumentosDialog.value = false
  selectedDocumentos.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Documentos Deleted',
    life: 3000
  })
}

const onFileSelect = (event: any) => {
  selectedFile = event.files[0]
}

const saveDocumento = async () => {
  submitted.value = true
  if (!documento.value?.nombre || !documento.value?.categoria_id) return
  const formData = new FormData()
  if (selectedFile) {
    formData.append('archivo_url', selectedFile)
  }
  formData.append('nombre', documento.value.nombre.toString())
  formData.append('tipo', TipoDocumento.TRAMITES)
  formData.append('categoria_id', documento.value.categoria_id.toString())
  try {
    if (documento.value.id) {
      formData.append('id', documento.value.id.toString())
      await documentoService.updateDocumento(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Updated',
        life: 3000
      })
    } else {
      await documentoService.createDocumento(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Created',
        life: 3000
      })
    }
    selectedFile = null
    hideDialog()
    loadDocumentos()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Documento',
      life: 3000
    })
  }
}
const openDialogPdf = async (url: string) => {
  pdfUrl.value = `${baseUrlResource}/${url}`
  console.log('pdfUrl.value', pdfUrl.value)
  visibleDialoPdf.value = true
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
                :disabled="!selectedDocumentos || !selectedDocumentos.length"
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
          :value="documentos"
          v-model:selection="selectedDocumentos"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Documentos"
          :autoLayout="true"
          :lazy="true"
          @page="loadDocumentos"
          @sort="loadDocumentos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Documentos Tramites</h4>
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
              <a style="cursor: pointer" @click="openDialogPdf(slotProps.data.archivo_url)">
                {{ slotProps.data.nombre }}
              </a>
            </template></Column
          >
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              {{ slotProps.data.tipo }}
            </template></Column
          >

          <Column field="categoria" header="Categoria">
            <template #body="slotProps">
              <span class="p-column-title">Categoria</span>
              <span v-if="slotProps.data.categoria && slotProps.data.categoria.nombre">
                {{ slotProps.data.categoria.nombre }}
              </span>
              <span v-else> No asignado </span>
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
                @click="editDocumento(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteDocumento(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="documentoDialog"
          :style="{ width: '450px' }"
          header="Documentos"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="documento.nombre"
              required="true"
              autofocus
              :invalid="submitted && !documento.nombre"
            />
            <small class="p-error" v-if="submitted && !documento.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <div class="field">
            <label for="Categoria">Categoria</label>
            <treeselect
              :options="treeNodes"
              v-model="documento.categoria_id"
              required="true"
              :invalid="submitted && !documento?.categoria_id"
            >
            </treeselect>
            <small class="p-error" v-if="submitted && !documento?.categoria_id"
              >Categoria es requerido.</small
            >
          </div>

          <div class="field">
            <label for="foto_url">Archivo</label>
            <Toast />
            <FileUpload
              id="archivo_url"
              v-model.trim="documento.archivo_url"
              mode="advanced"
              name="archivo_url"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !documento?.archivo_url"
              @select="onFileSelect($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !documento?.archivo_url"
              >Archivo es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDocumento" />
          </template>
        </Dialog>

        <!-- dialog delete -->
        <Dialog
          v-model:visible="deleteDocumentoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="documento"
              >¿Estás segura de que quieres eliminar <b>{{ documento.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDocumentoDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteDocumento" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteDocumentosDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="documento"
              >¿Estás seguro de que deseas eliminar las Categoria de Documentos seleccionadas?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDocumentosDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedDocumentos"
            />
          </template>
        </Dialog>

        <!-- Dialog para mostrar PDF -->
        <Dialog
          header="Visualizar PDF"
          v-model:visible="visibleDialoPdf"
          :modal="true"
          :style="{ width: '75vw' }"
        >
          <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="500px"></iframe>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
