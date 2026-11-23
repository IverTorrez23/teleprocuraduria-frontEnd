<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { DataTableSortEvent } from 'primevue/datatable'

import plantillaInformacionService from '../services/plantillaInformacion.service'
import type { IPlantillaInformacion } from '../types/plantillaInformacion.types'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { TinymceApiKey, TinymceConfig } from '@/constants/constants'

import { getEstado } from '@/common/utils/statusUtils'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'

const toast = useToast()
const dt = ref()

const plantillasInformacion = ref<IPlantillaInformacion[]>([])

const plantillaInformacionDialog = ref(false)
const deletePlantillaInformacionDialog = ref(false)

const submitted = ref(false)

const plantillaInformacion = ref<IPlantillaInformacion>({
  id: 0,
  nombre: '',
  cuerpo_plantilla: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const filters = ref({
  global: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS
  }
})

const pagination = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})

const loadPlantillasInformacion = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage

  const perPage = event ? event.rows : pagination.value.rowsPerPage

  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['nombre', 'cuerpo_plantilla'],
          keyword: filters.value.global.value
        }
      ]
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
    page,
    perPage,
    search,
    sort
  }

  const response = await plantillaInformacionService.getPlantillaInformacion(opciones)

  plantillasInformacion.value = response.result

  pagination.value.rowsNumber = response.pagination.rowsNumber

  pagination.value.totalItems = response.pagination.totalItems

  pagination.value.itemCount = response.pagination.itemCount

  pagination.value.rowsPerPage = response.pagination.rowsPerPage

  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadPlantillasInformacion()
})

watch(
  () => filters.value.global.value,
  () => {
    pagination.value.currentPage = 1
    loadPlantillasInformacion()
  }
)

const crearPlantillaInformacionVacia = (): IPlantillaInformacion => ({
  id: 0,
  nombre: '',
  cuerpo_plantilla: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const openNew = () => {
  plantillaInformacion.value = crearPlantillaInformacionVacia()
  submitted.value = false
  plantillaInformacionDialog.value = true
}

const hideDialog = () => {
  plantillaInformacionDialog.value = false
  submitted.value = false
}

const editPlantillaInformacion = (plantilla: IPlantillaInformacion) => {
  plantillaInformacion.value = {
    ...plantilla
  }

  submitted.value = false
  plantillaInformacionDialog.value = true
}

const confirmDeletePlantillaInformacion = (plantilla: IPlantillaInformacion) => {
  plantillaInformacion.value = {
    ...plantilla
  }

  deletePlantillaInformacionDialog.value = true
}

const savePlantillaInformacion = async () => {
  submitted.value = true

  if (!plantillaInformacion.value.nombre.trim()) {
    return
  }

  if (!plantillaInformacion.value.cuerpo_plantilla.trim()) {
    return
  }

  try {
    if (plantillaInformacion.value.id) {
      await plantillaInformacionService.updatePlantillaInformacion(plantillaInformacion.value)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'La plantilla de informacion fue actualizada correctamente.',
        life: 3000
      })
    } else {
      await plantillaInformacionService.createPlantillaInformacion(plantillaInformacion.value)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'La plantilla de informacion fue registrada correctamente.',
        life: 3000
      })
    }

    hideDialog()

    await loadPlantillasInformacion()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'No se pudo guardar la plantilla de informacion.',
      life: 5000
    })
  }
}

const deletePlantillaInformacion = async () => {
  try {
    if (!plantillaInformacion.value.id) {
      return
    }

    await plantillaInformacionService.deletePlantillaInformacion(plantillaInformacion.value)

    toast.add({
      severity: 'success',
      summary: 'Correcto',
      detail: 'La plantilla de informacion fue eliminada correctamente.',
      life: 3000
    })

    deletePlantillaInformacionDialog.value = false

    await loadPlantillasInformacion()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'No se pudo eliminar la plantilla de informacion.',
      life: 5000
    })
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
const viewTextCompleto = (text: string, headerModal: string) => {
  fullText.value = text
  modalTexCompletoVisible.value = true
  headerTextoCompleto.value = headerModal
}

const textMayorLimiteVisual = (html: string, limite: number) => {
  const text = html.replace(/<[^>]+>/g, '')
  if (text.length > limite) return true
  else return false
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
                label="Nuevo"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="openNew"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="plantillasInformacion"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} plantillas"
          :autoLayout="true"
          :lazy="true"
          @page="loadPlantillasInformacion"
          @sort="loadPlantillasInformacion"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Plantilla de Informacion</h4>

              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>

                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <template #empty> No se encontraron plantillas de informacion. </template>

          <Column field="id" header="ID" sortable style="width: 80px">
            <template #body="slotProps">
              <span class="p-column-title"> ID </span>

              {{ slotProps.data.id }}
            </template>
          </Column>

          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="p-column-title"> Nombre </span>

              {{ slotProps.data.nombre }}
            </template>
          </Column>

          <Column field="cuerpo_plantilla" header="Cuerpo" sortable>
            <template #body="slotProps">
              <span v-html="truncateHTML(slotProps.data.cuerpo_plantilla, 100)"></span>

              <Button
                v-if="textMayorLimiteVisual(slotProps.data.cuerpo_plantilla, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.cuerpo_plantilla, 'cuerpo')"
              />
            </template>
          </Column>

          <Column field="estado" header="Estado" style="width: 140px">
            <template #body="slotProps">
              <Tag :value="slotProps.data.estado" :severity="getEstado(slotProps.data.estado)" />
            </template>
          </Column>

          <Column header="Acciones" style="width: 150px">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editPlantillaInformacion(slotProps.data)"
              />

              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="confirmDeletePlantillaInformacion(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Crear / Editar -->
        <Dialog
          v-model:visible="plantillaInformacionDialog"
          :style="{
            width: '700px',
            maxWidth: '95vw'
          }"
          :header="
            plantillaInformacion.id
              ? 'Editar Plantilla de Informacion'
              : 'Nueva Plantilla de Informacion'
          "
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="plantillaInformacion.nombre"
              required="true"
              autofocus
              :invalid="submitted && !plantillaInformacion.nombre"
            />
            <small class="p-error" v-if="submitted && !plantillaInformacion.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <div class="field">
            <label for="cuerpo_plantilla" class="font-medium"> Cuerpo </label>

            <Editor
              id="cuerpo_plantilla"
              v-model="plantillaInformacion.cuerpo_plantilla"
              :api-key="TinymceApiKey"
              :init="TinymceConfig"
              required="true"
              :invalid="submitted && !plantillaInformacion.cuerpo_plantilla"
            />
            <small class="p-error" v-if="submitted && !plantillaInformacion.cuerpo_plantilla"
              >El Cuerpo es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />

            <Button
              label="Guardar"
              icon="pi pi-check"
              class="p-button-text"
              @click="savePlantillaInformacion"
            />
          </template>
        </Dialog>

        <!-- Eliminar -->
        <Dialog
          v-model:visible="deletePlantillaInformacionDialog"
          :style="{
            width: '450px',
            maxWidth: '95vw'
          }"
          header="Confirmar eliminación"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />

            <span>
              ¿Está seguro de eliminar la plantilla

              <b>
                {{ plantillaInformacion.nombre }}
              </b>
              ?
            </span>
          </div>

          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deletePlantillaInformacionDialog = false"
            />

            <Button
              label="Sí"
              icon="pi pi-check"
              class="p-button-text"
              @click="deletePlantillaInformacion"
            />
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
