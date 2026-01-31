<script setup lang="ts">
import type { IOrden } from '@/modules/general/Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { TableSize } from '@/constants/constants'
import ordenService from '@/modules/general/Ordenes/services/orden.service'
import finalCostoService from '../services/finalCosto.service'
import type { IFinalCosto } from '../types/finalCosto.types'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'

const toast = useToast()

const ordenes = ref<IOrden[]>([])
const submitted = ref(false)

const loading = ref(false)
const formCostoJudicialVentaDialog = ref(false)
const ordenSelected = ref<IOrden>()
const finalCostoJudicialVenta = ref<IFinalCosto>({
  id: 0,
  costo_procesal_venta: 0
} as IFinalCosto)

const loadOrdenesSinCostoJudicialVenta = async () => {
  const response = await ordenService.listarSinCostoJudicialVenta()
  if (response) {
    ordenes.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener ordenes para costo judicial venta',
      life: 4000
    })
  }
}

onMounted(() => {
  loadOrdenesSinCostoJudicialVenta()
})

const saveConfirmaCostoJudicialVentaSelected = async () => {
  submitted.value = true
  let contador = 0
  if (checkedRowsSelected.value.length < 1) return
  loading.value = true
  try {
    for (const orden of checkedRowsSelected.value) {
      const finalCosto = orden.final_costos as IFinalCosto

      // Validar si el finalCosto existe antes de enviarlo al servicio
      if (finalCosto) {
        await finalCostoService.colocarCostoJudicialVenta(finalCosto)
        contador = contador + 1
      }
    }
    if (contador === checkedRowsSelected.value.length) {
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Seleccionados Confirmados Correctamente',
        life: 4000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fallo al confirmar, no se registraron todos',
        life: 6000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al confirmar seleccionados',
      life: 3000
    })
  } finally {
    loading.value = false
    checkedRowsSelected.value = []
    loadOrdenesSinCostoJudicialVenta()
  }
}

const saveCostoJudicialVenta = async () => {
  submitted.value = true
  if (!ordenSelected.value) return
  try {
    finalCostoJudicialVenta.value.id = ordenSelected.value.final_costos?.id
      ? ordenSelected.value.final_costos?.id
      : 0
    if (finalCostoJudicialVenta.value.id && ordenSelected.value.final_costos) {
      if (
        finalCostoJudicialVenta.value.costo_procesal_venta <
        ordenSelected.value.final_costos?.costo_procesal_venta
      ) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El costo judicial venta no puede se menor que compra',
          life: 3000
        })
      } else {
        await finalCostoService.colocarCostoJudicialVenta(finalCostoJudicialVenta.value)
        formCostoJudicialVentaDialog.value = false
        toast.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Costo colocado correctamente',
          life: 2000
        })
      }
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al guardar presupuesto',
      life: 10000
    })
  } finally {
    submitted.value = false
    loadOrdenesSinCostoJudicialVenta()
  }
}

const checkedRowsSelected = ref<IOrden[]>([])

const handleCheckChange = (data: any) => {
  const index = checkedRowsSelected.value.indexOf(data)
  if (index === -1) {
    // Si no está en el array, agregar la fila seleccionada y sumar el monto
    checkedRowsSelected.value.push(data)
  } else {
    // Si ya está en el array, remover la fila y restar el monto
    checkedRowsSelected.value.splice(index, 1)
  }
}

const colocarCostoJudicialVenta = (ord: IOrden) => {
  ordenSelected.value = { ...ord }
  formCostoJudicialVentaDialog.value = true
}
</script>

<template>
  <div class="card p-3">
    <div class="col-12">
      <Toast />
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-5">
          <div class="flex justify-content-center mt-4">
            <Button
              label="CONFIRMAR SELECCIONADOS CON EL MONTO ANTERIOR"
              icon="pi pi-check"
              @click="saveConfirmaCostoJudicialVentaSelected"
              :disabled="loading || !checkedRowsSelected.length"
              v-if="!loading"
            />
            <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
          </div>
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
            <Column field="id" header="Número Orden" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.id }}
              </template></Column
            >

            <Column field="codigo" header="Codigo Causa" style="width: 7%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.causa?.materia?.abreviatura }}-{{
                  slotPropsOrden.data?.causa?.tipo_legal?.abreviatura
                }}-{{ slotPropsOrden.data?.causa?.id }}
              </template></Column
            >
            <Column field="entrega_informacion" header="Carga información" style="width: 17%">
              <template #body="slotPropsOrden">
                <span v-html="slotPropsOrden.data?.entrega_informacion"></span> </template
            ></Column>
            <Column
              field="descarga.detalle_informacion"
              header="Descarga información"
              style="width: 17%"
            >
              <template #body="slotPropsOrden">
                <span v-html="slotPropsOrden.data?.descarga?.detalle_informacion"></span> </template
            ></Column>
            <Column
              field="final_costos.costo_procesal_compra"
              header="Costo Judicial Compra"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.final_costos?.costo_procesal_compra }}
              </template>
            </Column>
            <Column
              field="presupuesto.detalle_presupuesto"
              header="Detalle presupuesto"
              style="width: 17%"
            >
              <template #body="slotPropsOrden">
                <span
                  v-html="slotPropsOrden.data?.presupuesto?.detalle_presupuesto"
                ></span> </template
            ></Column>

            <Column field="descarga.detalle_gasto" header="Detalle de gasto" style="width: 17%">
              <template #body="slotPropsOrden">
                <span v-html="slotPropsOrden.data?.descarga?.detalle_gasto"></span> </template
            ></Column>
            <Column
              field="final_costos.costo_procesal_venta"
              header="Costo Judicial Venta"
              style="width: 5%"
            >
              <template #body="slotPropsOrden">
                <i
                  class="pi pi-question-circle"
                  style="font-size: 1.3rem; cursor: pointer"
                  @click="colocarCostoJudicialVenta(slotPropsOrden.data)"
                ></i>
              </template>
            </Column>

            <Column field="select" header="Seleccionar" style="width: 5%">
              <template #body="slotPropsOrden">
                <Checkbox
                  :model-value="checkedRowsSelected.includes(slotPropsOrden.data)"
                  :value="slotPropsOrden.data"
                  binary
                  @update:model-value="handleCheckChange(slotPropsOrden.data)"
                /> </template
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="formCostoJudicialVentaDialog"
    :style="{ width: '70%' }"
    header="Colocar Costo Judicial Venta"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <DataTable
        ref="dt2"
        dataKey="id"
        :value="[ordenSelected]"
        columnResizeMode="fit"
        showGridlines
        :size="TableSize.small"
        tableStyle="width: 100%"
      >
        <Column field="id" header="Número orden" style="width: 5%">
          <template #body="">
            <span class="p-column-title">Número orden</span>
            {{ ordenSelected?.id }}
          </template></Column
        >
        <Column field="prioridad" header="Prioridad" style="width: 5%">
          <template #body="">
            <span class="p-column-title">Prioridad</span>
            {{ ordenSelected?.prioridad }}
          </template></Column
        >
        <Column field="fecha_inicio" header="Fecha inicio" style="width: 20%">
          <template #body="">
            <span class="p-column-title">Fecha inicio</span>
            {{ formatearFechaHora(ordenSelected?.fecha_inicio) }}
          </template></Column
        >
        <Column field="fecha_fin" header="Fecha fin" style="width: 25%">
          <template #body="">
            <span class="p-column-title">Fecha fin</span>
            {{ formatearFechaHora(ordenSelected?.fecha_fin) }}
          </template></Column
        >

        <Column
          field="final_costos.costo_procesal_compra"
          header="Costo Judicial Compra"
          style="width: 5%"
        >
          <template #body="">
            <span class="p-column-title">Costo Judicial Compra</span>
            {{ ordenSelected?.final_costos?.costo_procesal_compra }}
          </template></Column
        >
        <Column
          field="final_costos.costo_procesal_venta"
          header="Costo Judicial Venta"
          style="width: 5%"
        >
          <template #body="">
            <span class="p-column-title">Costo Judicial Venta</span>
            {{ ordenSelected?.final_costos?.costo_procesal_venta }}
          </template></Column
        >
        <Column
          field="final_costos.costo_procuraduria_compra"
          header="Costo Procuraduria Compra"
          style="width: 15%"
        >
          <template #body="">
            <span class="p-column-title">Costo Procuraduria Compra</span>
            {{ ordenSelected?.final_costos?.costo_procuraduria_compra }}
          </template></Column
        >
        <Column
          field="final_costos.costo_procuraduria_venta"
          header="Costo Procuraduria Venta"
          style="width: 15%"
        >
          <template #body="">
            <span class="p-column-title">Costo Procuraduria Venta</span>
            {{ ordenSelected?.final_costos?.costo_procuraduria_venta }}
          </template></Column
        >
        <Column field="final_costos.total_egreso" header="Egreso" style="width: 5%">
          <template #body="">
            <span class="p-column-title">Egreso</span>
            {{ ordenSelected?.final_costos?.total_egreso }}
          </template></Column
        >
      </DataTable>
    </div>
    <br />
    <div class="field">
      <label for="costo_procesal_venta">Costo Judicial Venta</label><br />
      <InputNumber
        id="costo_procesal_venta"
        type="text"
        v-model.number="finalCostoJudicialVenta.costo_procesal_venta"
        mode="currency"
        currency="BOB"
        locale="es-BO"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        :invalid="submitted && !finalCostoJudicialVenta.costo_procesal_venta === null"
        style="width: 40%"
      />
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="formCostoJudicialVentaDialog = false"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveCostoJudicialVenta"
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
