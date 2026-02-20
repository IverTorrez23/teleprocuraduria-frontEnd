<script setup lang="ts">
import type { IOrden } from '@/modules/general/Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import { TableSize } from '@/constants/constants'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import usuarioService from '@/modules/general/Usuarios/services/usuario.service'
import ordenService from '@/modules/general/Ordenes/services/orden.service'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import { CalificacionesOrden } from '@/constants/constants'
import procuradorPagoService from '../services/procuradorPago.service'
import type { IProcuradorPago } from '../types/procuradorPago.types'
import type { IFinalCosto } from '../../FinalCostos/types/finalCosto.types'
import dayjs from 'dayjs'

const toast = useToast()
const router = useRouter()
const selectedProcurador = ref(0)
const fechaInicioConsulta = ref('')
const fechaFinConsulta = ref('')
const ordenes = ref<IOrden[]>([])
const submitted = ref(false)

const procuradores = ref<IUsuario[]>([])
const loading = ref(false)
const btnConsultarLoading = ref(false)
const btnProcesarPagoProcLoading = ref(false)
const pagoExtraordinarioDialog = ref(false)
const montoPagoExtraordinario = ref(0)

const totalMontoPagar = ref(0)
const procuradorPagoSelect = ref<IProcuradorPago>()
const ProcuradorPago = ref<IProcuradorPago>({
  id: 0,
  monto: 0,
  fecha_inicio_consulta: '',
  fecha_fin_consulta: '',
  procurador_id: 0
} as IProcuradorPago)
const loadOrdenesParaPagoAProcurador = async (id: number) => {
  const response = await ordenService.listarParaPagoAProcurador(
    id,
    fechaInicioConsulta.value,
    fechaFinConsulta.value
  )
  if (response) {
    const ordenesCalculadas = response.map((orden) => {
      const monto =
        orden.calificacion === CalificacionesOrden.SUFICIENTE
          ? orden.cotizacion.compra
          : orden.cotizacion.penalizacion

      return {
        ...orden,
        monto_pagar: monto
      }
    })

    ordenes.value = ordenesCalculadas
    totalMontoPagar.value = ordenes.value.reduce(
      (sum, orden) => sum + parseFloat((orden as any).monto_pagar || '0'),
      0
    )
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener ordenes del procurador o no tiene ordenes',
      life: 4000
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
  loadProcuradores()
})

const savePagoProcurador = async () => {
  submitted.value = true
  ProcuradorPago.value.monto = totalMontoPagar.value
  ProcuradorPago.value.procurador_id = selectedProcurador.value
  ProcuradorPago.value.fecha_inicio_consulta = fechaInicioConsulta.value
  ProcuradorPago.value.fecha_fin_consulta = fechaFinConsulta.value

  if (ordenes.value.length < 1) return
  btnProcesarPagoProcLoading.value = true
  try {
    const finalCostoSeleccionadas: IFinalCosto[] = ordenes.value
      .map((orden) => orden.final_costos)
      .filter((p) => p !== undefined && p !== null) as IFinalCosto[] // Filtra null/undefined y asegura el tipo
    const result = await procuradorPagoService.createProcuradorPago(
      ProcuradorPago.value,
      finalCostoSeleccionadas
    )
    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: result,
      life: 3000
    })
    await resetValoresDeTabla()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al devolver presupuesto',
      life: 10000
    })
  } finally {
    btnProcesarPagoProcLoading.value = false
    submitted.value = false
  }
}
const savePagoProcuradorExtraordinario = async () => {
  submitted.value = true
  ProcuradorPago.value.monto = montoPagoExtraordinario.value
  ProcuradorPago.value.procurador_id = selectedProcurador.value
  ProcuradorPago.value.fecha_inicio_consulta = fechaInicioConsulta.value
  ProcuradorPago.value.fecha_fin_consulta = fechaFinConsulta.value

  if (!montoPagoExtraordinario.value || montoPagoExtraordinario.value < 1) return
  btnProcesarPagoProcLoading.value = true
  try {
    const finalCostoSeleccionadas: IFinalCosto[] = ordenes.value
      .map((orden) => orden.final_costos)
      .filter((p) => p !== undefined && p !== null) as IFinalCosto[] // Filtra null/undefined y asegura el tipo
    const result = await procuradorPagoService.createPagoExtraordinario(
      ProcuradorPago.value,
      finalCostoSeleccionadas
    )
    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: result,
      life: 3000
    })
    await resetValoresDeTabla()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al devolver presupuesto',
      life: 10000
    })
  } finally {
    btnProcesarPagoProcLoading.value = false
    pagoExtraordinarioDialog.value = false
    submitted.value = false
  }
}

const checkedRowsSelected = ref<IOrden[]>([])
const obtenerListadoOrden = async (procuradorId: number) => {
  submitted.value = true
  if (procuradorId === 0 || fechaInicioConsulta.value === '' || fechaFinConsulta.value === '')
    return
  btnConsultarLoading.value = true
  try {
    await resetValoresDeTabla()
    await loadOrdenesParaPagoAProcurador(procuradorId)
  } finally {
    submitted.value = false
    btnConsultarLoading.value = false
  }
}
const resetValoresDeTabla = async () => {
  checkedRowsSelected.value = []
  ordenes.value = []
}

const irAResumenPagos = () => {
  router.push({ name: 'ResumenPagos' })
}
const onProcuradorSeleccionado = async (event: any) => {
  const id = event.value
  await obtenerUltimoPagoProcurador(id)
}

const obtenerUltimoPagoProcurador = async (procuradorId: number) => {
  try {
    const response = await procuradorPagoService.obtenerUltimoDeProcurador(procuradorId)

    if (response) {
      procuradorPagoSelect.value = response
      fechaInicioConsulta.value = dayjs(response.fecha_fin_consulta).format('YYYY-MM-DD HH:mm')
    } else {
      fechaInicioConsulta.value = ''
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: (error as Error).message,
      life: 3000
    })
  }
}
const openNew = () => {
  //transaccionAdmin.value = {} as ITransaccionesAdmin
  //submitted.value = false
  pagoExtraordinarioDialog.value = true
}
const hideDialog = () => {
  pagoExtraordinarioDialog.value = false
  // submitted.value = false
}
</script>

<template>
  <div class="card p-3">
    <div class="col-12">
      <Toast />
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-4">
          <label for="solicite_procurador">Seleccione Procurador: </label>
          <Dropdown
            id="solicite_procurador"
            v-model="selectedProcurador"
            :options="procuradores"
            optionLabel="nombreCompleto"
            optionValue="id"
            filter
            filterPlaceholder="Buscar Procurador"
            @change="onProcuradorSeleccionado"
            :invalid="submitted && !selectedProcurador"
          />
          <small class="p-error" v-if="submitted && !selectedProcurador"
            >Seleccione un procurador.</small
          >
        </div>

        <div class="field col-12 md:col-3">
          <label for="fecha_inicio" class="block mb-2">Fecha Inicio Consulta</label>
          <Calendar
            id="fecha_inicio"
            :modelValue="fechaInicioConsulta ? new Date(fechaInicioConsulta) : null"
            @update:modelValue="
              (date) => (fechaInicioConsulta = date ? formatearFechaHora(date) : '')
            "
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
            :invalid="submitted && !fechaInicioConsulta"
          />
          <small class="p-error" v-if="submitted && !fechaInicioConsulta"
            >Seleccione fecha inicio.</small
          >
        </div>
        <div class="field col-12 md:col-3">
          <label for="fecha_fin" class="block mb-2">Fecha Fin Consulta</label>
          <Calendar
            id="fecha_fin"
            :modelValue="fechaFinConsulta ? new Date(fechaFinConsulta) : null"
            @update:modelValue="(date) => (fechaFinConsulta = date ? formatearFechaHora(date) : '')"
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
            :invalid="submitted && !fechaFinConsulta"
          />
          <small class="p-error" v-if="submitted && !fechaFinConsulta">Seleccione fecha fin.</small>
        </div>
        <Divider />
        <div class="field col-12 md:col-3 mt-1">
          <Button
            :label="btnConsultarLoading ? 'Consultando...' : 'Consultar'"
            :icon="btnConsultarLoading ? 'pi pi-spinner pi-spin' : 'pi pi-search'"
            :disabled="btnConsultarLoading"
            severity="success"
            class="mr-2"
            @click="obtenerListadoOrden(selectedProcurador)"
          />
        </div>

        <div class="field col-12 md:col-3 mt-1">
          <Button
            label="Resumen de Pagos"
            icon="pi pi-receipt"
            severity="contrast"
            class="mr-2"
            @click="irAResumenPagos"
          />
        </div>

        <Divider />
        <div class="field col-12">
          <DataTable
            ref="dtentrega"
            dataKey="id"
            :value="ordenes"
            columnResizeMode="fit"
            showGridlines
            :size="TableSize.small"
            tableStyle="width: 100%"
          >
            <Column field="codigo" header="Codigo Causa" style="width: 7%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.causa?.materia?.abreviatura }}-{{
                  slotPropsOrden.data?.causa?.tipo_legal?.abreviatura
                }}-{{ slotPropsOrden.data?.causa?.id }}
              </template></Column
            >

            <Column field="id" header="Número Orden" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.id }}
              </template></Column
            >

            <Column field="prioridad" header="Prioridad" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.prioridad }}
              </template></Column
            >

            <Column field="cotizacion.condicion" header="Plazo de orden" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ plazoSegunCondicion(slotPropsOrden.data.cotizacion.condicion) }}
              </template>
            </Column>

            <Column
              field="cotizacion.compra"
              header="Cotización Positiva de procuraduria"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.cotizacion.compra }}
              </template>
            </Column>

            <Column
              field="cotizacion.penalizacion"
              header="Cotización negativa de procuraduria"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.cotizacion.penalizacion }}
              </template>
            </Column>

            <Column field="monto_pagar" header="Monto a pagar" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.monto_pagar }}
              </template>
            </Column>

            <ColumnGroup type="footer">
              <Row>
                <Column
                  footer="Total a pagar en ese rango de tiempo:"
                  :colspan="6"
                  footerStyle="text-align:right"
                />
                <Column :footer="totalMontoPagar.toFixed(2)" />
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>
      <div class="flex justify-content-center mt-4">
        <Button
          label="Pago extraordinario"
          icon="pi pi-check"
          @click="openNew"
          v-if="totalMontoPagar < 0"
        />
        <!-- <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else /> -->

        <Button
          :label="btnProcesarPagoProcLoading ? 'Procesando...' : 'Procesar'"
          :icon="btnProcesarPagoProcLoading ? 'pi pi-spinner pi-spin' : 'pi pi-check'"
          :disabled="btnProcesarPagoProcLoading || !ordenes.length"
          severity="success"
          class="mr-2"
          @click="savePagoProcurador()"
          v-if="totalMontoPagar >= 0"
        />
      </div>
    </div>
  </div>
  <!-- Pago extraordinario -->
  <Dialog
    v-model:visible="pagoExtraordinarioDialog"
    :style="{ width: '450px' }"
    header="Pago extraordinario"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="nombre">Monto</label>
      <InputNumber
        id="monto"
        v-model="montoPagoExtraordinario"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :min="1"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && (montoPagoExtraordinario === null || montoPagoExtraordinario < 1)"
      />
      <small class="p-error" v-if="submitted && !montoPagoExtraordinario"
        >Monto es requerido.</small
      >
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        @click="savePagoProcuradorExtraordinario"
      />
    </template>
  </Dialog>
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
