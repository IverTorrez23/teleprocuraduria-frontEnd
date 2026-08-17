<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import type { DataTableSortEvent } from 'primevue/datatable'

import CuponService from '../services/cupon.service'
import type { ICupon } from '../types/cupon.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'

import * as XLSX from 'xlsx'
import type { ICuponGeneradoExcel } from '../types/cupon.types'
import QRCode from 'qrcode'

const router = useRouter()
const route = useRoute()
const idpaquete = Number(route.params.idPaquete)

const toast = useToast()

const dt = ref()
const cupones = ref<ICupon[]>([])

const cuponDialog = ref(false)
const deleteCuponDialog = ref(false)

const submitted = ref(false)
const loading = ref(false)

const crearCuponVacio = (): ICupon => ({
  id: 0,
  codigo: '',
  fecha_uso: '',
  paquete_id: idpaquete,
  usuario_id: 0,
  estado: 'ACTIVO',
  es_eliminado: 0,
  created_at: '',
  updated_at: '',
  cantidad: 0
})

const cupon = ref<ICupon>(crearCuponVacio())

const filters = ref({
  global: {
    value: null as string | null,
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

const obtenerMensajeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Ocurrió un error inesperado.'
}

const loadCupones = async (event?: DataTableSortEvent) => {
  try {
    loading.value = true

    const page = event && event.rows ? event.first / event.rows + 1 : pagination.value.currentPage

    const perPage = event?.rows ?? pagination.value.rowsPerPage

    const search: ISearch[] = filters.value.global.value
      ? [
          {
            fields: ['codigo', 'fecha_uso', 'estado'],
            keyword: filters.value.global.value
          }
        ]
      : []

    const sort: ISort[] = event?.sortField
      ? [
          {
            field: typeof event.sortField === 'string' ? event.sortField : '',
            orderType: event.sortOrder === 1 ? 'ASC' : 'DESC'
          }
        ]
      : []

    const options: IOpcionesPaginado = {
      page,
      perPage,
      search,
      sort
    }

    const response = await CuponService.getCuponesDePaquete(options, idpaquete)

    cupones.value = response.result

    pagination.value = {
      ...pagination.value,
      rowsNumber: response.pagination.rowsNumber,
      totalItems: response.pagination.totalItems,
      itemCount: response.pagination.itemCount,
      rowsPerPage: response.pagination.rowsPerPage,
      perPage: response.pagination.perPage,
      currentPage: response.pagination.currentPage
    }
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: obtenerMensajeError(error),
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const cantidad = ref<number>(1)
const loadingGeneracion = ref(false)

const descargarExcelCupones = (cupones: ICuponGeneradoExcel[], nombrePaquete: string) => {
  const datosExcel = cupones.map((cupon, index) => ({
    'N.º': index + 1,
    'Código del cupón': cupon.codigo,
    'Nombre del paquete': cupon.nombre_paquete,
    'Fecha límite de activación': cupon.fecha_limite_activacion ?? 'Sin fecha límite',
    'Vigencia en días': cupon.vigencia_dias,
    'Precio (Bs.)': cupon.precio
  }))

  const hoja = XLSX.utils.json_to_sheet(datosExcel)

  hoja['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 35 }, { wch: 28 }, { wch: 20 }, { wch: 18 }]

  const libro = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(libro, hoja, 'Cupones')

  const nombreLimpio = nombrePaquete
    .trim()
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_')
    .replace(/_+/g, '_')

  const fecha = new Date().toISOString().slice(0, 10)

  XLSX.writeFile(libro, `cupones_${nombreLimpio}_${fecha}.xlsx`)
}

const generarCupones = async () => {
  submitted.value = true

  if (!cupon.value.paquete_id) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'No se encontró el paquete.',
      life: 3000
    })

    return
  }

  if (!cantidad.value || cantidad.value < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'La cantidad debe ser mayor a cero.',
      life: 3000
    })

    return
  }

  try {
    loadingGeneracion.value = true

    const response = await CuponService.generarCuponesLote({
      paquete_id: cupon.value.paquete_id,
      cantidad: cantidad.value
    })

    descargarExcelCupones(response.data.cupones, response.data.paquete.nombre)

    toast.add({
      severity: 'success',
      summary: 'Cupones generados',
      detail: `${response.data.cantidad_generada} cupones ` + 'generados correctamente.',
      life: 4000
    })

    cantidad.value = 1
    hideDialog()

    await loadCupones()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'No se pudieron generar los cupones.',
      life: 5000
    })
  } finally {
    loadingGeneracion.value = false
  }
}

onMounted(() => {
  loadCupones()
})

watch(
  () => filters.value.global.value,
  () => {
    pagination.value.currentPage = 1
    loadCupones()
  }
)

const openNew = () => {
  cupon.value = crearCuponVacio()
  submitted.value = false
  cuponDialog.value = true
}

const hideDialog = () => {
  cuponDialog.value = false
  submitted.value = false
}

const editCupon = (item: ICupon) => {
  cupon.value = { ...item }
  submitted.value = false
  cuponDialog.value = true
}

const confirmDeleteCupon = (item: ICupon) => {
  cupon.value = { ...item }
  deleteCuponDialog.value = true
}

const saveCupon = async () => {
  submitted.value = true

  if (!cupon.value.paquete_id) {
    return
  }

  try {
    loading.value = true

    if (cupon.value.id) {
      await CuponService.updateCupon(cupon.value)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Cupón actualizado correctamente.',
        life: 3000
      })
    } else {
      const nuevoCupon: Omit<ICupon, 'id'> = {
        codigo: '',
        fecha_uso: '',
        paquete_id: cupon.value.paquete_id,
        usuario_id: 0,
        estado: 'ACTIVO',
        es_eliminado: 0,
        created_at: '',
        updated_at: '',
        cantidad: 0
      }

      await CuponService.createCupon(nuevoCupon)

      toast.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Cupón creado correctamente.',
        life: 3000
      })
    }

    hideDialog()
    await loadCupones()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: obtenerMensajeError(error),
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const deleteCupon = async () => {
  if (!cupon.value.id) {
    return
  }

  try {
    loading.value = true

    await CuponService.deleteCupon(cupon.value)

    deleteCuponDialog.value = false

    toast.add({
      severity: 'success',
      summary: 'Correcto',
      detail: 'Cupón eliminado correctamente.',
      life: 3000
    })

    await loadCupones()
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: obtenerMensajeError(error),
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const formatearFecha = (fecha?: string): string => {
  if (!fecha) return 'No utilizado'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(fecha))
}

const copiarCodigo = async (codigo: string) => {
  try {
    await navigator.clipboard.writeText(codigo)

    toast.add({
      severity: 'success',
      summary: 'Copiado',
      detail: `El código ${codigo} fue copiado.`,
      life: 2000
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo copiar el código.',
      life: 3000
    })
  }
}

const generarQr = async () => {
  try {
    if (!idpaquete) {
      toast.add({
        severity: 'warn',
        summary: 'Paquete no válido',
        detail: 'No se pudo identificar el paquete.',
        life: 3000
      })

      return
    }

    // Obtiene automáticamente:
    // Desarrollo: http://localhost:5173
    // Producción: https://misistema.com
    const dominio = window.location.origin

    const urlCanjeo =
      `${dominio}/canjeo/${idpaquete}/cupon`

    const qrDataUrl = await QRCode.toDataURL(urlCanjeo, {
      width: 1000,
      margin: 3,
      errorCorrectionLevel: 'H'
    })

    const link = document.createElement('a')

    link.href = qrDataUrl
    link.download =
      `QR_Canjeo_Paquete_${idpaquete}.png`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({
      severity: 'success',
      summary: 'QR generado',
      detail: 'El código QR se descargó correctamente.',
      life: 3000
    })
  } catch (error) {
    console.error('Error al generar QR:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo generar el código QR.',
      life: 4000
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
            <Button label="Nuevo cupón" icon="pi pi-plus" severity="success" @click="openNew" />
          </template>
          <template #end>
            <Button label="Generar QR" icon="pi pi-qrcode" severity="success" @click="generarQr" />
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="cupones"
          dataKey="id"
          :paginator="true"
          :rows="pagination.rowsPerPage"
          :totalRecords="pagination.totalItems"
          :filters="filters"
          :loading="loading"
          :lazy="true"
          :autoLayout="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cupones"
          @page="loadCupones"
          @sort="loadCupones"
        >
          <template #header>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3"
            >
              <h4 class="m-0">Administrar cupones</h4>

              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>

                <InputText v-model="filters.global.value" placeholder="Buscar cupón..." />
              </IconField>
            </div>
          </template>

          <template #empty> No se encontraron cupones. </template>

          <template #loading> Cargando cupones... </template>

          <Column field="id" header="ID" sortable>
            <template #body="{ data }">
              {{ data.id }}
            </template>
          </Column>

          <Column field="codigo" header="Código" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <Tag :value="data.codigo" severity="info" icon="pi pi-ticket" />

                <Button
                  icon="pi pi-copy"
                  text
                  rounded
                  severity="secondary"
                  v-tooltip.top="'Copiar código'"
                  @click="copiarCodigo(data.codigo)"
                />
              </div>
            </template>
          </Column>

          <!-- <Column field="paquete_id" header="Paquete" sortable>
            <template #body="{ data }">
              {{ data.paquete_id }}
            </template>
          </Column> -->

          <Column field="fecha_uso" header="Fecha de uso" sortable>
            <template #body="{ data }">
              <span v-if="data.fecha_uso">
                {{ formatearFecha(data.fecha_uso) }}
              </span>

              <Tag v-else value="Disponible" severity="success" />
            </template>
          </Column>

          <Column field="usuario_id" header="Usuario" >
            <template #body="{ data }">
              <span v-if="data.usuario_id">
                {{ data.usuario.persona.nombre }}  {{ data.usuario.persona.apellido }}
              </span>

              <span v-else class="text-500"> Sin usuario </span>
            </template>
          </Column>

          <Column field="estado" header="Estado" sortable>
            <template #body="{ data }">
              <Tag :value="data.estado" :severity="getEstado(data.estado)" />
            </template>
          </Column>

          <Column header="Acciones">
            <template #body="{ data }">
              <div class="flex gap-2">
                <!-- <Button
                  icon="pi pi-pencil"
                  rounded
                  severity="success"
                  v-tooltip.top="'Editar'"
                  @click="editCupon(data)"
                /> -->

                <Button
                  icon="pi pi-trash"
                  rounded
                  severity="warning"
                  v-tooltip.top="'Eliminar'"
                  @click="confirmDeleteCupon(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Crear/editar cupón -->
        <Dialog
          v-model:visible="cuponDialog"
          :style="{ width: '450px' }"
          :header="cupon.id ? 'Editar cupón' : 'Generar cupones'"
          :modal="true"
          class="p-fluid"
        >
          <div v-if="cupon.id" class="field">
            <label for="codigo">Código</label>

            <InputText id="codigo" v-model="cupon.codigo" disabled />

            <small class="text-500"> El código es generado automáticamente por el sistema. </small>
          </div>

          <div class="field">
            <label for="cantidad"> Cantidad de cupones </label>

            <InputNumber
              id="cantidad"
              v-model="cantidad"
              :min="1"
              :max="500"
              :useGrouping="false"
              showButtons
              buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              :invalid="submitted && cantidad < 1"
            />

            <small v-if="submitted && cantidad < 1" class="p-error">
              Debe generar al menos un cupón.
            </small>
          </div>

          <div class="field">
            <label for="paquete_id">Paquete</label>

            <InputNumber
              style="display: none"
              id="paquete_id"
              v-model="cupon.paquete_id"
              :useGrouping="false"
              :min="1"
              :invalid="submitted && !cupon.paquete_id"
              placeholder="Ingrese el ID del paquete"
            />

            <small v-if="submitted && !cupon.paquete_id" class="p-error">
              El paquete es requerido.
            </small>
          </div>

          <div v-if="cupon.id" class="field">
            <label for="estado">Estado</label>

            <Dropdown
              id="estado"
              v-model="cupon.estado"
              :options="['ACTIVO', 'INACTIVO']"
              placeholder="Seleccione un estado"
            />
          </div>

          <template #footer>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text
              severity="secondary"
              @click="hideDialog"
            />

            <Button label="Generar y descargar" icon="pi pi-file-excel" :loading="loadingGeneracion" @click="generarCupones" />
          </template>
        </Dialog>

        <!-- Confirmar eliminación -->
        <Dialog
          v-model:visible="deleteCuponDialog"
          :style="{ width: '450px' }"
          header="Confirmación"
          :modal="true"
        >
          <div class="flex align-items-center">
            <i class="pi pi-exclamation-triangle mr-3 text-orange-500" style="font-size: 2rem" />

            <span>
              ¿Está seguro de eliminar el cupón
              <strong>{{ cupon.codigo }}</strong
              >?
            </span>
          </div>

          <template #footer>
            <Button
              label="No"
              icon="pi pi-times"
              text
              severity="secondary"
              @click="deleteCuponDialog = false"
            />

            <Button
              label="Sí, eliminar"
              icon="pi pi-trash"
              severity="danger"
              :loading="loading"
              @click="deleteCupon"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
