<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import detalleOrdenService from '../../Ordenes/DetalleOrden/services/detalleOrden.service'
import type { IOrden, IOrdenCodigo } from '../../Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { formatCausaCodigo } from '@/common/utils/formatCausaCodigo'
import { TableSize, TinymceApiKey, TinymceConfig } from '@/constants/constants'
import type { IDescarga } from '../types/descarga.types'
import descargaService from '../services/descarga.service'
import { obtenerFechaYHoraActual } from '@/common/utils/fechaHoraActual'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'

const router = useRouter()
const toast = useToast()
const route = useRoute()
const idOrden = Number(route.params.idOrden)
const idCausa = ref(0)

const detalleOrden = ref<IOrden>()
const submitted = ref(false)

const loading = ref(false)

const descarga = ref<IDescarga>({
  id: 0,
  detalle_informacion: '',
  detalle_documentacion: '',
  ultima_foja: '',
  gastos: 0,
  saldo: 0,
  detalle_gasto: '',
  orden_id: idOrden
} as IDescarga)

const ultimaFojaDescarga = ref<IDescarga>()
const loadDetallOrden = async () => { 
  const response = await detalleOrdenService.listarDetalleOrden(idOrden)

  if (response.data) {
    const orden: IOrdenCodigo = {
      ...response.data,
      codigoCausa: formatCausaCodigo(response.data)
    }
    detalleOrden.value = {
      ...orden,
      codigoCausa: orden.codigoCausa
    }  as unknown as IOrden

    idCausa.value = detalleOrden.value.causa_id
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: response.errors || 'No se pudo obtener detalle de la orden.',
      life: 3000
    })
  }
  await loadUltimaFojaDescargaDeCausa(idCausa.value)
}
const loadUltimaFojaDescargaDeCausa = async (id: number) => {
  const result = await descargaService.obtenerUltimaFojaCausa(id)
  if (result) {
    ultimaFojaDescarga.value = result
    descarga.value.ultima_foja = ultimaFojaDescarga.value.ultima_foja
  }
}

onMounted(() => {
  loadDetallOrden()
})

const saveDescarga = async () => {
  submitted.value = true
  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    if (descarga.value.id) {
      await descargaService.updateDescarga(descarga.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Descarga actualizada',
        life: 3000
      })
    } else {
      const fechaHoraActual = obtenerFechaYHoraActual()
      const fechafinal = formatearFechaHora(detalleOrden.value?.fecha_fin)
      const mensajeToast = ref('')
      const tipoToast = ref<'success' | 'warn'>('success')
      if (fechaHoraActual > fechafinal) {
        mensajeToast.value = 'Descarga registrada, fuera del plazo de vigencia '
        tipoToast.value = 'warn'
      } else {
        mensajeToast.value = 'Descarga registrada, dentro del plazo de vigencia '
        tipoToast.value = 'success'
      }

      await descargaService.createDescarga(descarga.value)
      toast.add({
        severity: tipoToast.value,
        summary: 'Successful',
        detail: mensajeToast.value,
        life: 4000
      })
      resetForm()
    }

    setTimeout(() => {
      router.push({ name: 'Lista Ordenes', params: { idCausa: idCausa.value } })
    }, 4000)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 10000
    })
  } finally {
    loading.value = false
    submitted.value = false
  }
}
const handleInputChange = (event: any) => {
  const valorActual = event.value
  let saldo = 0
  if (valorActual && detalleOrden.value?.presupuesto?.monto) {
    saldo = detalleOrden.value?.presupuesto?.monto - valorActual
    descarga.value.saldo = saldo
  }
  console.log('Saldo:', descarga.value.saldo)
}
const validateForm = () => {
  const mensajeToast = ref('')
  if (!descarga.value.detalle_informacion) {
    mensajeToast.value = 'Ingrese detalle de la información.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (!descarga.value.detalle_documentacion) {
    mensajeToast.value = 'Ingrese detalle de documentación.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (!descarga.value.detalle_gasto) {
    mensajeToast.value = 'Ingrese detalle de gasto.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (!descarga.value.ultima_foja) {
    mensajeToast.value = 'Ingrese última foja.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (descarga.value.gastos === null) {
    mensajeToast.value = 'Ingrese monto de gasto.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Si todas las validaciones pasan
  return true
}
const resetForm = () => {
  descarga.value.detalle_informacion = ''
  descarga.value.detalle_documentacion = ''
  descarga.value.detalle_gasto = ''
  descarga.value.ultima_foja = ''
  descarga.value.gastos = 0
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
      <h5>Ingreso de Descarga</h5>

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
          header=" CARGA DE INFORMACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_informacion"></span>
          </template>
        </Column>
      </DataTable>
      <div class="card p-3">
        <div class="col-12">
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <h5 for="detalle_informacion">INFORMACIÓN DESCARGA</h5>
              <Editor
                id="detalle_informacion"
                v-model="descarga.detalle_informacion"
                :api-key="TinymceApiKey"
                :init="TinymceConfig"
                required
                :invalid="submitted && !descarga.detalle_informacion"
              />
              <small class="p-error" v-if="submitted && !descarga.detalle_informacion">
                Informacion de descarga es requerido.
              </small>
            </div>
          </div>
        </div>
      </div>

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
          header="CARGA DE DOCUMENTACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_documentacion"></span>
          </template>
        </Column>
      </DataTable>

      <div class="card p-3">
        <div class="col-12">
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <h5 for="detalle_documentacion">DOCUMENTACIÓN DESCARGA</h5>
              <Editor
                id="detalle_documentacion"
                v-model="descarga.detalle_documentacion"
                :api-key="TinymceApiKey"
                :init="TinymceConfig"
                required
                :invalid="submitted && !descarga.detalle_documentacion"
              />
              <small class="p-error" v-if="submitted && !descarga.detalle_documentacion">
                Detalle de doumento es requerido.
              </small>
            </div>
          </div>
        </div>
      </div>

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
          header="DETALLE DE PRESUPUESTO"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.presupuesto?.detalle_presupuesto"></span>
          </template>
        </Column>
      </DataTable>
      <div class="card p-3">
        <div class="col-12">
          <div class="p-fluid formgrid grid">
            <div class="field col-12">
              <h5 for="detalle_gasto">DETALLE DE GASTO</h5>
              <Editor
                id="detalle_gasto"
                v-model="descarga.detalle_gasto"
                :api-key="TinymceApiKey"
                :init="TinymceConfig"
                required
                :invalid="submitted && !descarga.detalle_gasto"
              />
              <small class="p-error" v-if="submitted && !descarga.detalle_gasto">
                Detalle de gasto es requerido.
              </small>
            </div>
          </div>
        </div>
      </div>

      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-4">
          <label for="ultima_foja">Ultima Foja: {{ ultimaFojaDescarga?.ultima_foja }} </label><br />
          <label for="ultima_foja">Foja: </label>
          <InputText
            id="ultima_foja"
            v-model="descarga.ultima_foja"
            type="text"
            :invalid="submitted && !descarga.ultima_foja"
          />
          <small class="p-error" v-if="submitted && !descarga.ultima_foja">
            Foja es requerido.
          </small>
        </div>

        <div class="field col-12 md:col-4">
          <label for="ultima_foja"
            >Presupuesto de carga: {{ detalleOrden?.presupuesto?.monto }} </label
          ><br />
          <label for="gastos">Gasto: </label>

          <InputNumber
            id="gastos"
            type="text"
            v-model.number="descarga.gastos"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :invalid="submitted && !descarga.gastos === null"
            @input="handleInputChange"
          />
          <small class="p-error" v-if="submitted && !descarga.gastos === null">
            Gasto es requerido.
          </small>
        </div>
      </div>
    </div>
  </div>

  <div class="card p-3">
    <div class="flex justify-content-center mt-4">
      <Button
        label="PROCESAR"
        icon="pi pi-check"
        @click="saveDescarga"
        :disabled="loading"
        v-if="!loading"
      />
      <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
    </div>
  </div>
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
