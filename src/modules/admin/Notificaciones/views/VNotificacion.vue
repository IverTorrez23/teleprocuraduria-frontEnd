<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { INotificacion } from '../types/notificacion.types'
import notificacionService from '../services/notificacion.service'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize } from '@/constants/constants'
import { TipoNotificacion, TipoReceptor } from '@/common/utils/constNotificaciones'

const toast = useToast()
const dt = ref()
const notificaciones = ref<INotificacion[]>([])
const notificacionDialog = ref(false)
const deleteNotificacionDialog = ref(false)
const notificacion = ref<INotificacion>({
  id: 0,
  tipo: 0,
  evento: '',
  emisor: '',
  nombre_emisor: '',
  tipo_receptor: 0,
  receptor_estatico: '',
  descripcion_receptor_estatico: '',
  asunto: '',
  envia_notificacion: 0,
  texto: '',
  usuario_id: 0
} as INotificacion)
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

const loadNotificaciones = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [
        {
          fields: [
            'tipo',
            'nombre_emisor',
            'tipo_receptor',
            'receptor_estatico',
            'evento',
            'asunto',
            'texto',
            'emisor',
            'descripcion_receptor_estatico'
          ],
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
    page: page,
    perPage: perPage,
    search: search,
    sort: sort
  }
  const response = await notificacionService.getNotificacion(opciones)

  notificaciones.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadNotificaciones()
})
watch(
  () => filters.value.global.value,
  () => {
    loadNotificaciones()
  }
)

const openNew = () => {
  notificacion.value = {} as INotificacion
  notificacion.value.envia_notificacion = 0 //Por defecto no envia
  submitted.value = false
  notificacionDialog.value = true
}

const hideDialog = () => {
  notificacionDialog.value = false
  submitted.value = false
}

const editNotificacion = (not: INotificacion) => {
  notificacion.value = { ...not }
  notificacionDialog.value = true
}

const confirmDeleteNotificacion = (not: INotificacion) => {
  notificacion.value = not
  deleteNotificacionDialog.value = true
}

const deleteFunNotificacion = async () => {
  try {
    if (notificacion.value && notificacion.value.id) {
      await notificacionService.deleteNotificacion(notificacion.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Notificacion Deleted',
        life: 3000
      })
      deleteNotificacionDialog.value = false
      loadNotificaciones()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Notificacion',
      life: 3000
    })
  }
}

const saveNotificacion = async () => {
  submitted.value = true
  if (
    !notificacion.value?.tipo ||
    !notificacion.value?.evento ||
    !notificacion.value?.asunto ||
    !notificacion.value?.texto ||
    (notificacion.value?.tipo_receptor == 2 && !notificacion.value?.receptor_estatico)
  )
    return

  try {
    if (notificacion.value.id) {
      await notificacionService.updateNotificacion(notificacion.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'notificacion Updated',
        life: 3000
      })
    } else {
      await notificacionService.createNotificacion(notificacion.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'notificacion Created',
        life: 3000
      })
    }
    hideDialog()
    loadNotificaciones()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save notificacion',
      life: 3000
    })
  }
}

const rowStyle = (data: any) => {
  if (data.fecha_limite_compra) {
    const fechaLimite = new Date(data.fecha_limite_compra.replace(/-/g, '/'))
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Resetear hora para comparar solo fechas
    if (fechaLimite < hoy) {
      return { fontStyle: 'italic', backgroundColor: '#f1f1f1', color: '#a9a9a9' }
    }
  }
}
const enviaNotificacionBool = computed({
  get: () => notificacion.value.envia_notificacion === 1,
  set: (val: boolean) => {
    notificacion.value.envia_notificacion = val ? 1 : 0
  }
})
const getTipoNotificacion = (value: number): string => {
  const found = TipoNotificacion.find((t) => t.value === value)
  return found ? found.label : '-'
}
const getTipoReceptor = (value: number): string => {
  const found = TipoReceptor.find((t) => t.value === value)
  return found ? found.label : '-'
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
          :value="notificaciones"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Notificaciones"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
          :rowStyle="rowStyle"
          @page="loadNotificaciones"
          @sort="loadNotificaciones"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <h4 class="m-0">Administrar Notificaciones</h4>
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
              </IconField>
            </div>
          </template>

          <Column field="id" header="ID" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Id</span>
              {{ slotProps.data.id }}
            </template></Column
          >
          <Column field="tipo" header="Tipo" sortable>
            <template #body="slotProps">
              <Tag
                :value="getTipoNotificacion(slotProps.data.tipo)"
                :severity="slotProps.data.tipo === 1 ? 'info' : 'success'"
              />
            </template>
          </Column>
          <Column field="evento" header="Evento" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Evento</span>
              {{ slotProps.data.evento }}
            </template></Column
          >
          <Column field="emisor" header="Emisor" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Emisor</span>
              {{ slotProps.data.emisor }}
            </template></Column
          >

          <Column field="nombre_emisor" header="Nombre emisor" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Nombre emisor</span>
              {{ slotProps.data.nombre_emisor }}
            </template></Column
          >

          <Column field="tipo_receptor" header="Tipo receptor" sortable>
            <template #body="slotProps">
              <Tag
                :value="getTipoReceptor(slotProps.data.tipo_receptor)"
                :severity="slotProps.data.tipo_receptor === 1 ? 'success' : 'info'"
              />
            </template>
          </Column>

          <Column field="receptor_estatico" header="Receptor estatico" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Receptor estatico</span>
              {{ slotProps.data.receptor_estatico }}
            </template></Column
          >

          <Column field="descripcion_receptor_estatico" header="Descripción Receptor" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Descripción Receptor</span>
              {{ slotProps.data.descripcion_receptor_estatico }}
            </template></Column
          >

          <Column field="asunto" header="Asunto" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Asunto</span>
              {{ slotProps.data.asunto }}
            </template></Column
          >
          <Column field="envia_notificacion" header="Envia notificación?" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.envia_notificacion === 1 ? 'Sí' : 'No'"
                :severity="slotProps.data.envia_notificacion === 1 ? 'success' : 'danger'"
              /> </template
          ></Column>
          <Column field="texto" header="Texto" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Texto</span>
              {{ slotProps.data.texto }}
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
                style="width: 30px; height: 30px"
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editNotificacion(slotProps.data)"
              />
              <Button
                style="width: 30px; height: 30px"
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning mt-2"
                @click="confirmDeleteNotificacion(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>

        <!-- create and edit -->
        <Dialog
          v-model:visible="notificacionDialog"
          :style="{ width: '450px' }"
          header="Notificacion"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="tipo">Tipo</label>
            <Dropdown
              id="tipo"
              v-model="notificacion.tipo"
              :options="TipoNotificacion"
              optionLabel="label"
              optionValue="value"
              filter
              filterPlaceholder="Buscar Tipo"
              :invalid="submitted && !notificacion?.tipo"
            />
            <small class="p-error" v-if="submitted && !notificacion?.tipo"
              >Tipo es requerido.</small
            >
          </div>
          <div class="field">
            <label for="evento">Evento</label>
            <InputText
              id="evento"
              v-model.trim="notificacion.evento"
              required="true"
              autofocus
              :invalid="submitted && !notificacion.evento"
            />
            <small class="p-error" v-if="submitted && !notificacion.evento"
              >Evento es requerido.</small
            >
          </div>
          <div class="field">
            <label for="emisor">Emisor (correo@example.com)</label>
            <InputText
              id="emisor"
              v-model.trim="notificacion.emisor"
              required="true"
              autofocus
              :invalid="submitted && !notificacion.emisor"
              :disabled="notificacion.tipo == 2 ? true : false"
            />
            <small
              class="p-error"
              v-if="submitted && notificacion.tipo == 1 && !notificacion.emisor"
              >Emisor es requerido.</small
            >
          </div>
          <div class="field">
            <label for="nombre_emisor">Nombre emisor</label>
            <InputText
              id="nombre_emisor"
              v-model.trim="notificacion.nombre_emisor"
              required="true"
              autofocus
              :invalid="submitted && !notificacion?.nombre_emisor"
              :disabled="notificacion.tipo == 2 ? true : false"
            />
            <small
              class="p-error"
              v-if="submitted && notificacion.tipo == 1 && !notificacion?.nombre_emisor"
              >Nombre emisor es requerido.</small
            >
          </div>

          <div class="field">
            <label for="tipo_receptor">Tipo receptor</label>
            <Dropdown
              id="tipo_receptor"
              v-model="notificacion.tipo_receptor"
              :options="TipoReceptor"
              optionLabel="label"
              optionValue="value"
              filter
              filterPlaceholder="Buscar Tipo receptor"
              :invalid="submitted && !notificacion?.tipo_receptor"
            />
            <small class="p-error" v-if="submitted && !notificacion?.tipo_receptor"
              >Tipo es requerido.</small
            >
          </div>

          <div class="field">
            <label for="receptor_estatico">Receptor estatico (receptor@example.com)</label>
            <InputText
              id="receptor_estatico"
              v-model.trim="notificacion.receptor_estatico"
              required="true"
              autofocus
              :invalid="submitted && !notificacion?.receptor_estatico"
              :disabled="notificacion.tipo_receptor == 1 ? true : false"
            />
            <small
              class="p-error"
              v-if="
                submitted && notificacion.tipo_receptor == 2 && !notificacion?.receptor_estatico
              "
              >Receptor estatico es requerido.</small
            >
          </div>

          <div class="field">
            <label for="descripcion_receptor_estatico">Descripcion receptor estatico</label>
            <InputText
              id="descripcion_receptor_estatico"
              v-model.trim="notificacion.descripcion_receptor_estatico"
              required="true"
              autofocus
              :invalid="submitted && !notificacion?.descripcion_receptor_estatico"
              :disabled="notificacion.tipo_receptor == 1 ? true : false"
            />
            <small
              class="p-error"
              v-if="
                submitted &&
                notificacion.tipo_receptor == 2 &&
                !notificacion?.descripcion_receptor_estatico
              "
              >Descripcion receptor es requerido.</small
            >
          </div>

          <div class="field">
            <label for="asunto">Asunto</label>
            <InputText
              id="asunto"
              v-model.trim="notificacion.asunto"
              required="true"
              autofocus
              :invalid="submitted && !notificacion?.asunto"
            />
            <small class="p-error" v-if="submitted && !notificacion?.asunto"
              >Asunto es requerido.</small
            >
          </div>

          <div class="field">
            <label for="texto">Texto</label>
            <Textarea
              id="texto"
              v-model="notificacion.texto"
              rows="3"
              required="true"
              autofocus
              :invalid="submitted && !notificacion?.texto"
            />
            <small class="p-error" v-if="submitted && !notificacion?.texto">Texto requerido</small>
          </div>
          <div class="field">
            <label for="envia_notificacion">Envia notificacion?</label>
            <InputSwitch v-model="enviaNotificacionBool" />
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveNotificacion"
            />
          </template>
        </Dialog>

        <!-- dialog delete  -->
        <Dialog
          v-model:visible="deleteNotificacionDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="notificacion">¿Estás segura de que quieres eliminar ?</span>
          </div>
          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              class="p-button-text"
              @click="deleteNotificacionDialog = false"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              class="p-button-text"
              @click="deleteFunNotificacion"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
