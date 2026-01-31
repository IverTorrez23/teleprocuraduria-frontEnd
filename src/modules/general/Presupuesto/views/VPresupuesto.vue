<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import detalleOrdenService from '../../Ordenes/DetalleOrden/services/detalleOrden.service'
import type { IOrden, IOrdenCodigo } from '../../Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { formatCausaCodigo } from '@/common/utils/formatCausaCodigo'
import { TableSize, TinymceApiKey, TinymceConfig } from '@/constants/constants'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import tribunalService from '../../Tribunal/services/tribunal.service'
import type { ITribunal } from '../../Tribunal/types/tribunal.types'
import { baseUrlResource } from '@/config/constants'
import OVisorImg from '@/components/OVisorImg.vue'
import { PRIORIDAD } from '@/constants/orden'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import usuarioService from '../../Usuarios/services/usuario.service'
import type { IPresupuesto } from '../types/presupuesto.types'
import presupuestoService from '../services/presupuesto.service'

const router = useRouter()
const toast = useToast()
const route = useRoute()
const idOrden = Number(route.params.idOrden)
const idCausa = ref(0)

const detalleOrden = ref<IOrden>()
const submitted = ref(false)

const tribunales = ref<ITribunal[]>([])
const procuradores = ref<IUsuario[]>([])
const loading = ref(false)
const presupuesto = ref<IPresupuesto>({
  id: 0,
  monto: 0,
  detalle_presupuesto: '',
  orden_id: idOrden,
  prioridad: 3,
  procurador_id: 0
} as IPresupuesto)
const loadDetallOrden = async () => {
  const response = await detalleOrdenService.listarDetalleOrden(idOrden)

  if (response.data) {
    const orden: IOrdenCodigo = {
      ...response.data,
      codigoCausa: formatCausaCodigo(response.data.data)
    }
    //detalleOrden.value = orden
    detalleOrden.value = {
      ...orden.data,
      codigoCausa: orden.codigoCausa
    }
    presupuesto.value.procurador_id = detalleOrden.value.procurador_id
    if (detalleOrden.value.presupuesto?.id) {
      presupuesto.value.detalle_presupuesto = detalleOrden.value?.presupuesto?.detalle_presupuesto
        ? detalleOrden.value?.presupuesto?.detalle_presupuesto
        : ''
      presupuesto.value.monto = detalleOrden.value?.presupuesto?.monto
        ? detalleOrden.value?.presupuesto?.monto
        : 0
      presupuesto.value.id = detalleOrden.value.presupuesto?.id
    } else {
      presupuesto.value.detalle_presupuesto = detalleOrden.value.sugerencia_presupuesto
    }
    idCausa.value = detalleOrden.value.causa_id
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: response.errors || 'No se pudo obtener detalle de la orden.',
      life: 3000
    })
  }
  loadTribunalesPorCausa(detalleOrden.value?.causa_id ? detalleOrden.value?.causa_id : 0)
}
const loadTribunalesPorCausa = async (id: number) => {
  const response = await tribunalService.listarTribunalPorCausa(id)
  if (response) {
    tribunales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener tribunales de causa',
      life: 3000
    })
  }
}
const loadProcuradores = async () => {
  const result = await usuarioService.listarUsuariosProcurador()

  if (result.data) {
    procuradores.value =
      result.data?.map((procurador) => ({
        ...procurador,
        nombreCompleto: `${procurador.persona?.nombre || ''} ${procurador.persona?.apellido || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener los procuradores.',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDetallOrden()
  loadProcuradores()
})

const openNewWindow = async (url: string) => {
  window.open(url, '_blank')
}
const selectedImageUrl = ref('')
const showImageDialog = ref(false)
const showImage = (url: string) => {
  selectedImageUrl.value = `${baseUrlResource}/${url}`
  showImageDialog.value = true
}
const savePresupuesto = async () => {
  submitted.value = true
  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    if (presupuesto.value.id) {
      await presupuestoService.updatePresupuesto(presupuesto.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Presupuesto update',
        life: 3000
      })
    } else {
      await presupuestoService.createPresupuesto(presupuesto.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Presupuesto registrado',
        life: 3000
      })
    }
    presupuesto.value.detalle_presupuesto = ''
    presupuesto.value.procurador_id = 0
    setTimeout(() => {
      router.push({ name: 'Lista Ordenes', params: { idCausa: idCausa.value } })
    }, 3000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al guardar presupuesto',
      life: 10000
    })
  } finally {
    loading.value = false
    submitted.value = false
  }
}
const validateForm = () => {
  const mensajeToast = ref('')
  if (!presupuesto.value.procurador_id) {
    mensajeToast.value = 'Seleccione un procurador gestor.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (presupuesto.value.monto === null) {
    console.log('presupuesto.value.monto', presupuesto.value.monto)
    mensajeToast.value = 'Ingrese un monto para el presupuesto.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (!presupuesto.value.detalle_presupuesto) {
    mensajeToast.value = 'Ingrese detalle del presupuesto'
    alertToastError(mensajeToast.value)
    return false
  }
  // Si todas las validaciones pasan
  return true
}

const alertToastError = (mensaje: string) => {
  toast.add({
    severity: 'error',
    summary: 'Validación',
    detail: mensaje,
    life: 4000
  })
}
</script>

<template>
  <div class="card p-3">
    <div class="col-12">
      <Toast />
      <!-- Tabla de tribunales -->
      <br />
      <DataTable
        ref="dtTribunal"
        dataKey="id"
        :value="tribunales"
        resizableColumns
        columnResizeMode="fit"
        showGridlines
        :size="TableSize.small"
        tableStyle="min-width: 50rem"
      >
        <Column field="clase_tribunal" header="Fisiologia Tribunal">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Fisiologia Tribunal</span>
            {{ slotPropsTribunal.data?.clase_tribunal?.nombre }}
          </template></Column
        >
        <Column field="nombre" header="Nombre Tribunal">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Nombre Tribunal</span>
            {{ slotPropsTribunal.data?.juzgado?.nombre_numerico }}°
            {{ slotPropsTribunal.data?.juzgado?.jerarquia }}
            {{ slotPropsTribunal.data?.juzgado?.materia_juzgado }}
            {{ slotPropsTribunal.data?.juzgado?.distrito?.abreviatura }}
          </template></Column
        >
        <Column field="ubicacion" header="Ubicación">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Ubicación</span>
            <Button
              icon="pi pi-map-marker"
              style="width: 30px; height: 30px"
              class="p-button-rounded p-button-success mr-2"
              @click="openNewWindow(slotPropsTribunal.data?.juzgado?.coordenadas)"
            /> </template
        ></Column>
        <Column field="foto" header="Fachada">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Fachada</span>
            <Button
              style="width: 30px; height: 30px"
              icon="pi pi-image"
              class="p-button-rounded p-button-success mr-2"
              @click="showImage(slotPropsTribunal.data?.juzgado?.foto_url)"
            /> </template
        ></Column>
        <Column field="piso" header="Piso">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Piso</span>
            {{ slotPropsTribunal.data?.juzgado?.piso?.nombre }}
          </template>
        </Column>
      </DataTable>

      <h5>Detalle de la Orden</h5>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column field="codigoCausa" header="Código de Causa" style="min-width: 3rem" frozen />

        <Column field="id" header="Número de la Orden" style="min-width: 3rem"></Column>
        <Column field="prioridad" header="Bandera" style="min-width: 4rem"></Column>

        <Column field="cotizacion.condicion" header="Plazo en Horas" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.cotizacion?.condicion
                ? plazoSegunCondicion(detalleOrden?.cotizacion?.condicion)
                : ''
            }}
          </template>
        </Column>
        <Column field="descarga.ultima_foja" header="Ultima Foja" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.descarga?.ultima_foja }}
          </template>
        </Column>
        <Column
          field="procurador.name"
          header="Procurador"
          style="min-width: 6rem"
          frozen
          alignFrozen="left"
        >
          <template #body="">
            {{ detalleOrden?.procurador?.persona?.nombre }}
            {{ detalleOrden?.procurador?.persona?.apellido }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <h5>Elementos de la Orden</h5>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column
          field="entrega_informacion"
          header="INFORMACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_informacion"></span>
          </template>
        </Column>
      </DataTable>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column
          field="entrega_documentacion"
          header="DOCUMENTACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_documentacion"></span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-4">
          <label for="prioridad">Bandera sugerida: {{ detalleOrden?.prioridad }}</label>
          <Dropdown
            id="prioridad"
            v-model.number="presupuesto.prioridad"
            :options="PRIORIDAD"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione una bandera"
          />
        </div>
        <div class="field col-12 md:col-4">
          <label for="solicite_procurador"
            >Procurador por defecto: {{ detalleOrden?.procurador.persona?.apellido }},
            {{ detalleOrden?.procurador.persona?.nombre }}</label
          >
          <Dropdown
            id="solicite_procurador"
            v-model.number="presupuesto.procurador_id"
            :options="procuradores"
            optionLabel="nombreCompleto"
            optionValue="id"
            filter
            filterPlaceholder="Buscar Procurador"
            :invalid="submitted && !presupuesto.procurador_id"
          />
          <small class="p-error" v-if="submitted && !presupuesto.procurador_id">
            Procurador es requerido.
          </small>
        </div>
        <div class="field col-12 md:col-4">
          <label for="monto">Monto de presupuesto</label>
          <InputNumber
            id="monto"
            type="text"
            v-model.number="presupuesto.monto"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :invalid="submitted && !presupuesto.monto === null"
          />
          <small class="p-error" v-if="submitted && !presupuesto.monto === null">
            Monto es requerido.
          </small>
        </div>
        <Divider />
        <div class="field col-12">
          <h5 for="detalle_presupuesto">Detalle de presupuesto</h5>
          <Editor
            id="detalle_presupuesto"
            v-model="presupuesto.detalle_presupuesto"
            :api-key="TinymceApiKey"
            :init="TinymceConfig"
            required
            :invalid="submitted && !presupuesto.detalle_presupuesto"
          />
          <small class="p-error" v-if="submitted && !presupuesto.detalle_presupuesto">
            Detalle de presupuesto es requerido.
          </small>
        </div>
      </div>
      <div class="flex justify-content-center mt-4">
        <Button
          label="PROCESAR"
          icon="pi pi-check"
          @click="savePresupuesto"
          :disabled="loading"
          v-if="!loading"
        />
        <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
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
<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.field.full-width {
  grid-column: span 3;
}
.field {
  margin-bottom: 0.1rem; /* disminuir el espacio */
}
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .field.full-width {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .field.full-width {
    grid-column: span 1;
  }
}
</style>
