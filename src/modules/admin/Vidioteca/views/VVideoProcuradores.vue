<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import videoService from '../services/video.service'
import type { IVideo } from '../types/video.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize } from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'

const toast = useToast()
const dt = ref()
const videos = ref<IVideo[]>([])
const videoDialog = ref(false)
const deleteVideoDialog = ref(false)
const video = ref<IVideo>({
  id: 0,
  link: '',
  titulo: '',
  descripcion: '',
  tipo: '',
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

const loadVideos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['titulo', 'descripcion'], keyword: filters.value.global.value }]
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
  const response = await videoService.getVideosProcurador(opciones)

  videos.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadVideos()
})
watch(
  () => filters.value.global.value,
  () => {
    loadVideos()
  }
)
const openNew = () => {
  video.value = {} as IVideo
  submitted.value = false
  videoDialog.value = true
}

const hideDialog = () => {
  videoDialog.value = false
  submitted.value = false
}

const editVideo = (vid: IVideo) => {
  video.value = { ...vid }
  videoDialog.value = true
}

const confirmDeleteVideo = (vid: IVideo) => {
  video.value = vid
  deleteVideoDialog.value = true
}

const deleteVideo = async () => {
  try {
    if (video.value && video.value.id) {
      await videoService.deleteVideo(video.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Video Deleted',
        life: 3000
      })
      deleteVideoDialog.value = false
      loadVideos()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Video',
      life: 3000
    })
  }
}

const saveVideo = async () => {
  submitted.value = true
  if (!video.value?.titulo || !video.value?.link) return

  try {
    video.value.tipo = 'PROCURADOR'
    if (video.value.id) {
      await videoService.updateVideo(video.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Video Updated',
        life: 3000
      })
    } else {
      await videoService.createVideo(video.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Video Created',
        life: 3000
      })
    }
    hideDialog()
    loadVideos()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save Video', life: 3000 })
  }
}

//Para visualizacion de textos completos
const modalTexCompletoVisible = ref(false)
const fullText = ref('')
const headerTextoCompleto = ref('')

const truncateHTML = (html: string, length: number) => {
  const text = html.replace(/<[^>]+>/g, '') // Remueve las etiquetas HTML para obtener texto plano
  text.slice(0, length) // Trunca el texto plano dejando solamente la cantidad de caracteres segun length
  const isTruncated = text.length > length
  let finalHTML = ''
  let charCount = 0

  const regex = /(<[^>]+>|[^<]+)/g // Match tags or text
  let match
  while ((match = regex.exec(html)) !== null && charCount < length) {
    const part = match[0]

    if (part.startsWith('<')) {
      // Si es una etiqueta HTML, la agregamos sin modificar
      finalHTML += part
    } else {
      // Si es texto, lo truncamos si excede el límite
      const remainingChars = length - charCount
      finalHTML += part.slice(0, remainingChars)
      charCount += part.length
    }
  }
  if (isTruncated) {
    finalHTML += '...'
  }
  return finalHTML
}

const textMayorLimiteVisual = (html: string, limite: number) => {
  const text = html //.replace(/<[^>]+>/g, '')
  if (text.length > limite) return true
  else return false
}
const viewTextCompleto = (text: string, headerModal: string) => {
  fullText.value = text
  modalTexCompletoVisible.value = true
  headerTextoCompleto.value = headerModal
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

        <DataTable
          ref="dt"
          :value="videos"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Videos"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          @page="loadVideos"
          @sort="loadVideos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Videos Para Procuradores</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

         
          <Column field="titulo" header="Título" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Título</span>
              {{ slotProps.data.titulo }}
            </template></Column
          >
          <Column field="descripcion" header="Descripción" sortable style="width: 30%;">
            <template #body="slotProps">
              <span v-html="truncateHTML(slotProps.data.descripcion, 70)"></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.descripcion, 70)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.descripcion, 'Descripción')"
              /> </template
          ></Column>
          
          <Column field="link" header="Video">
            <template #body="slotProps">
              <div
                class="shadow-2 p-3 h-full flex flex-column surface-card"
                style="border-radius: 6px"
              >
                <div class="flex align-items-center justify-content-center">
                  <iframe
                    :src="slotProps.data.link"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    width="100%"
                    height="100%"
                  ></iframe>
                </div>
              </div> </template
          ></Column>

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
                style="width: 30px; height: 30px"
                class="p-button-rounded p-button-success mr-2"
                @click="editVideo(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                style="width: 30px; height: 30px"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteVideo(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="videoDialog"
          :style="{ width: '450px' }"
          header="Video Para Procuradores"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="titulo">Titulo</label>
            <InputText
              id="titulo"
              v-model.trim="video.titulo"
              required="true"
              autofocus
              :invalid="submitted && !video.titulo"
            />
            <small class="p-error" v-if="submitted && !video.titulo">Titulo es requerido.</small>
          </div>

          <div class="field">
            <label for="link">Link</label>
            <InputText
              id="link"
              v-model.trim="video.link"
              required="true"
              autofocus
              :invalid="submitted && !video.link"
            />
            <small class="p-error" v-if="submitted && !video.link">Link es requerido.</small>
          </div>

          <div class="field">
            <label for="descripcion">Descripción</label>
            <InputText
              id="descripcion"
              v-model.trim="video.descripcion"
              required="true"
              autofocus
              :invalid="submitted && !video.descripcion"
            />
            <small class="p-error" v-if="submitted && !video.descripcion"
              >Descripción es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveVideo" />
          </template>
        </Dialog>

        <!-- dialog delete -->
        <Dialog
          v-model:visible="deleteVideoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="video"
              >¿Estás segura de que quieres eliminar <b>{{ video.titulo }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteVideoDialog = false"
            />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteVideo" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>

  <OVisorTextCompleto
    :fullText="fullText"
    :visible="modalTexCompletoVisible"
    @update:visible="modalTexCompletoVisible = $event"
    :header="headerTextoCompleto"
  />
</template>
<style scoped lang="scss"></style>
