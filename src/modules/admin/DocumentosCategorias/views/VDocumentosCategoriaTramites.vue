<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import documentoCategoriaService from '../services/documentoCategoria.service'
import type { IDocumentoCategoria } from '../types/documentosCategorias.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { ITreeNode } from '../types/treeNode.types'
import { TipoDocumento } from '@/constants/constants'

const toast = useToast()
const dt = ref()
const docCategorias = ref<IDocumentoCategoria[]>([])
const docCategoriaDialog = ref(false)
const deleteDocCategoriaDialog = ref(false)
const deleteDocCategoriasDialog = ref(false)
const docCategoria = ref<IDocumentoCategoria>({
  id: 0,
  nombre: '',
  tipo: '',
  categoria_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})
const treeNodes = ref<ITreeNode[]>([])


const selectedDocCategorias = ref<IDocumentoCategoria[]>([])
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

const loadDocCategorias = async (event?: DataTableSortEvent) => {
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
  const response = await documentoCategoriaService.getDocCategoriasTramites(opciones)

  docCategorias.value = response.result
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
    // Insertar la categoría "Sin Categoría" al inicio del array
    categorias.unshift({
      id: '0',
      label: 'Sin Categoría'
    })

    // Asignar las categorías al treeNodes
    treeNodes.value = categorias
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Solo categorias tramites',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDocCategorias()
  loadSoloCategorias()
})
watch(
  () => filters.value.global.value,
  () => {
    loadDocCategorias()
  }
)
const openNew = () => {
  docCategoria.value = {} as IDocumentoCategoria
  submitted.value = false
  docCategoriaDialog.value = true
}

const hideDialog = () => {
  docCategoriaDialog.value = false
  submitted.value = false
}

const editDocCategoria = (docCat: IDocumentoCategoria) => {
  docCategoria.value = { ...docCat }
  docCategoriaDialog.value = true
}

const confirmDeleteDocCategoria = (docCat: IDocumentoCategoria) => {
  docCategoria.value = docCat
  deleteDocCategoriaDialog.value = true
}

const deleteDocCategoria = async () => {
  try {
    if (docCategoria.value && docCategoria.value.id) {
      await documentoCategoriaService.deleteDocCategoria(docCategoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Categoria Deleted',
        life: 3000
      })
      deleteDocCategoriaDialog.value = false
      loadDocCategorias()
      loadSoloCategorias()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Documento Categoria',
      life: 3000
    })
  }
}

const exportCSV = () => {
  dt.value?.exportCSV()
}

const confirmDeleteSelected = () => {
  deleteDocCategoriasDialog.value = true
}

const deleteSelectedDocCategorias = () => {
  docCategorias.value = docCategorias.value.filter(
    (val) => !selectedDocCategorias.value.includes(val)
  )
  deleteDocCategoriasDialog.value = false
  selectedDocCategorias.value = []
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Selected Documentos categoria Deleted',
    life: 3000
  })
}

const saveDocCategoria = async () => {
  submitted.value = true
  if (!docCategoria.value?.nombre) return

  try {
    if (docCategoria.value.id) {
      await documentoCategoriaService.updateDocCategoria(docCategoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Categoria Updated',
        life: 3000
      })
    } else {
      docCategoria.value.tipo = TipoDocumento.TRAMITES //Por defecto su tipo es TRAMITES
      await documentoCategoriaService.createDocCategoria(docCategoria.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Categoria Created',
        life: 3000
      })
    }
    hideDialog()
    loadDocCategorias()
    loadSoloCategorias()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Documento Categoria',
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
                :disabled="!selectedDocCategorias || !selectedDocCategorias.length"
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
          :value="docCategorias"
          v-model:selection="selectedDocCategorias"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Docuemntos Categorias"
          :autoLayout="true"
          :lazy="true"
          @page="loadDocCategorias"
          @sort="loadDocCategorias"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Categoría de Trámites</h4>
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
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              {{ slotProps.data.tipo }}
            </template></Column
          >

          <Column field="tipo" header="Pertenece a ">
            <template #body="slotProps">
              <span class="p-column-title">Pertenece a</span>
              <span v-if="slotProps.data.padre && slotProps.data.padre.nombre">
                {{ slotProps.data.padre.nombre }}
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
                @click="editDocCategoria(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteDocCategoria(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="docCategoriaDialog"
          :style="{ width: '450px' }"
          header="Categoría de Trámites"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="docCategoria.nombre"
              required="true"
              autofocus
              :invalid="submitted && !docCategoria.nombre"
            />
            <small class="p-error" v-if="submitted && !docCategoria.nombre"
              >Nombre es requerido.</small
            >
          </div>
          
          <div class="field">
            <label for="subcategoria">Pertenece a ?</label>
            <treeselect :options="treeNodes" v-model="docCategoria.categoria_id"> </treeselect>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveDocCategoria"
            />
          </template>
        </Dialog>

        <!-- dialog delete -->
        <Dialog
          v-model:visible="deleteDocCategoriaDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="docCategoria"
              >¿Estás segura de que quieres eliminar <b>{{ docCategoria.nombre }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDocCategoriaDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteDocCategoria"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteDocCategoriasDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="docCategoria"
              >¿Estás seguro de que deseas eliminar las Categoria de Documentos seleccionadas?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteDocCategoriasDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSelectedDocCategorias"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
