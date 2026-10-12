<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { DataTableSortEvent } from 'primevue/datatable'

import sugerenciaGastoService from '../services/sugerenciaGasto.service'
import type { ISugerenciaGasto } from '../types/sugerenciaGasto.types'

import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'

import { getEstado } from '@/common/utils/statusUtils'

const toast = useToast()
const dt = ref()

const sugerenciasGastos = ref<ISugerenciaGasto[]>([])

const sugerenciaGastoDialog = ref(false)
const deleteSugerenciaGastoDialog = ref(false)

const submitted = ref(false)

const sugerenciaGasto = ref<ISugerenciaGasto>({
  id: 0,
  detalle: '',
  monto: 0,
  orden_id: 0,
  usuario_id: 0,
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

const loadSugerenciasGastos = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage

  const perPage = event ? event.rows : pagination.value.rowsPerPage

  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: ['detalle', 'monto'],
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

  const response = await sugerenciaGastoService.getSugerenciasGastos(opciones)

  sugerenciasGastos.value = response.result

  pagination.value.rowsNumber = response.pagination.rowsNumber

  pagination.value.totalItems = response.pagination.totalItems

  pagination.value.itemCount = response.pagination.itemCount

  pagination.value.rowsPerPage = response.pagination.rowsPerPage

  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadSugerenciasGastos()
})

watch(
  () => filters.value.global.value,
  () => {
    pagination.value.currentPage = 1
    loadSugerenciasGastos()
  }
)

const crearSugerenciaVacia = (): ISugerenciaGasto => ({
  id: 0,
  detalle: '',
  monto: 0,
  orden_id: 0,
  usuario_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const openNew = () => {
  sugerenciaGasto.value = crearSugerenciaVacia()
  submitted.value = false
  sugerenciaGastoDialog.value = true
}

const hideDialog = () => {
  sugerenciaGastoDialog.value = false
  submitted.value = false
}

const editSugerenciaGasto = (sugerencia: ISugerenciaGasto) => {
  sugerenciaGasto.value = {
    ...sugerencia
  }

  submitted.value = false
  sugerenciaGastoDialog.value = true
}

const confirmDeleteSugerenciaGasto = (sugerencia: ISugerenciaGasto) => {
  sugerenciaGasto.value = {
    ...sugerencia
  }

  deleteSugerenciaGastoDialog.value = true
}

const saveSugerenciaGasto = async () => {
  submitted.value = true

  if (!sugerenciaGasto.value.detalle.trim()) {
    return
  }

  if (!sugerenciaGasto.value.monto || Number(sugerenciaGasto.value.monto) <= 0) {
    return
  }

  try {
    if (sugerenciaGasto.value.id) {
      await sugerenciaGastoService.updateSugerenciaGasto(sugerenciaGasto.value)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'La sugerencia de gasto fue actualizada correctamente.',
        life: 3000
      })
    } else {
      await sugerenciaGastoService.createSugerenciaGasto(sugerenciaGasto.value)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'La sugerencia de gasto fue registrada correctamente.',
        life: 3000
      })
    }

    hideDialog()

    await loadSugerenciasGastos()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'No se pudo guardar la sugerencia de gasto.',
      life: 5000
    })
  }
}

const deleteSugerenciaGasto = async () => {
  try {
    if (!sugerenciaGasto.value.id) {
      return
    }

    await sugerenciaGastoService.deleteSugerenciaGasto(sugerenciaGasto.value)

    toast.add({
      severity: 'success',
      summary: 'Correcto',
      detail: 'La sugerencia de gasto fue eliminada correctamente.',
      life: 3000
    })

    deleteSugerenciaGastoDialog.value = false

    await loadSugerenciasGastos()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'No se pudo eliminar la sugerencia de gasto.',
      life: 5000
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
          :value="sugerenciasGastos"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} sugerencias"
          :autoLayout="true"
          :lazy="true"
          @page="loadSugerenciasGastos"
          @sort="loadSugerenciasGastos"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Plantilla de Gastos</h4>

              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>

                <InputText v-model="filters.global.value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <template #empty> No se encontraron sugerencias de gasto. </template>

          <Column field="id" header="ID" sortable style="width: 80px">
            <template #body="slotProps">
              <span class="p-column-title"> ID </span>

              {{ slotProps.data.id }}
            </template>
          </Column>

          <Column field="detalle" header="Detalle" sortable>
            <template #body="slotProps">
              <span class="p-column-title"> Detalle </span>

              {{ slotProps.data.detalle }}
            </template>
          </Column>

          <Column field="monto" header="Monto" sortable style="width: 160px">
            <template #body="slotProps">
              <span class="p-column-title"> Monto </span>

              <span class="font-semibold">
                {{ Number(slotProps.data.monto).toFixed(2) }}
                Bs.
              </span>
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
                @click="editSugerenciaGasto(slotProps.data)"
              />

              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="confirmDeleteSugerenciaGasto(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Crear / Editar -->
        <Dialog
          v-model:visible="sugerenciaGastoDialog"
          :style="{
            width: '500px',
            maxWidth: '95vw'
          }"
          :header="sugerenciaGasto.id ? 'Editar Sugerencia de Gasto' : 'Nueva Sugerencia de Gasto'"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="detalle" class="font-medium"> Detalle </label>

            <Textarea
              id="detalle"
              v-model.trim="sugerenciaGasto.detalle"
              rows="4"
              autoResize
              autofocus
              placeholder="Ingrese el detalle de la sugerencia"
              :invalid="submitted && !sugerenciaGasto.detalle"
            />

            <small v-if="submitted && !sugerenciaGasto.detalle" class="p-error">
              El detalle es requerido.
            </small>
          </div>

          <div class="field">
            <label for="monto" class="font-medium"> Monto </label>

            <InputNumber
              id="monto"
              v-model="sugerenciaGasto.monto"
              mode="decimal"
              :min="0"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              suffix=" Bs."
              placeholder="0.00"
              :invalid="submitted && Number(sugerenciaGasto.monto) <= 0"
            />

            <small v-if="submitted && Number(sugerenciaGasto.monto) <= 0" class="p-error">
              El monto debe ser mayor a cero.
            </small>
          </div>

          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />

            <Button
              label="Guardar"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveSugerenciaGasto"
            />
          </template>
        </Dialog>

        <!-- Eliminar -->
        <Dialog
          v-model:visible="deleteSugerenciaGastoDialog"
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
              ¿Está seguro de eliminar la sugerencia

              <b>
                {{ sugerenciaGasto.detalle }}
              </b>
              ?
            </span>
          </div>

          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteSugerenciaGastoDialog = false"
            />

            <Button
              label="Sí"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteSugerenciaGasto"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
