<script setup lang="ts">
import type { IOrden } from '../../Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { TableSize } from '@/constants/constants'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import usuarioService from '../../Usuarios/services/usuario.service'
import ordenService from '../../Ordenes/services/orden.service'
import type { IConfirmacion } from '../../Confirmacion/types/confirmacion.types'
import confirmacionService from '../../Confirmacion/services/confirmacion.service'

const toast = useToast()

const selectedProcurador = ref(0)
const ordenes = ref<IOrden[]>([])
const submitted = ref(false)

const procuradores = ref<IUsuario[]>([])
const loading = ref(false)

const loadOrdenesDevolverPresupuesto = async (id: number) => {
  const response = await ordenService.listarParaDevolverPresupuesto(id)
  if (response) {
    ordenes.value = response
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

const savePronuncioContador = async () => {
  submitted.value = true
  let contador = 0
  if (checkedRowsSelected.value.length < 1) return
  loading.value = true
  try {
    const confirmacionesSeleccionadas: IConfirmacion[] = checkedRowsSelected.value
      .map((orden) => orden.descarga?.confirmacion)
      .filter((p) => p !== undefined && p !== null) as IConfirmacion[] // Filtra null/undefined y asegura el tipo
    const result = await confirmacionService.devolverSaldoMasivo(confirmacionesSeleccionadas)
    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: result.message,
      life: 3000
    })
    await resetValoresDeTabla()
    
  } catch (error:any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al devolver presupuesto',
      life: 10000
    })
  } finally {
    loading.value = false
  }
}
let totalDevolver = 0
const montoTotalDevolver = ref('0')
const checkedRowsSelected = ref<IOrden[]>([])
const obtenerListadoOrden = async (procuradorId: number) => {
  /*totalDevolver = 0
  montoTotalDevolver.value = '0'
  checkedRowsSelected.value = []
  ordenes.value = []*/
  await resetValoresDeTabla()
  await loadOrdenesDevolverPresupuesto(procuradorId)
}
const resetValoresDeTabla = async () => {
  totalDevolver = 0
  montoTotalDevolver.value = '0'
  checkedRowsSelected.value = []
  ordenes.value = []
}

const handleCheckChange = (data: any) => {
  const index = checkedRowsSelected.value.indexOf(data)
  const monto = data.descarga?.saldo || 0
  if (index === -1) {
    // Si no está en el array, agregar la fila seleccionada y sumar el monto
    checkedRowsSelected.value.push(data)
    totalDevolver += parseFloat(monto)
  } else {
    // Si ya está en el array, remover la fila y restar el monto
    checkedRowsSelected.value.splice(index, 1)
    totalDevolver -= parseFloat(monto)
  }
  montoTotalDevolver.value = `${totalDevolver.toFixed(2)}`
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
            @change="obtenerListadoOrden(selectedProcurador)"
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
              field="presupuesto.detalle_presupuesto"
              header="Detalle presupuesto"
              style="width: 17%"
            >
              <template #body="slotPropsOrden">
                <span
                  v-html="slotPropsOrden.data?.presupuesto?.detalle_presupuesto"
                ></span> </template
            ></Column>
            <Column
              field="descarga.detalle_informacion"
              header="Descarga información"
              style="width: 17%"
            >
              <template #body="slotPropsOrden">
                <span v-html="slotPropsOrden.data?.descarga?.detalle_informacion"></span> </template
            ></Column>
            <Column field="descarga.detalle_gasto" header="Detalle de gasto" style="width: 17%">
              <template #body="slotPropsOrden">
                <span v-html="slotPropsOrden.data?.descarga?.detalle_gasto"></span> </template
            ></Column>
            <Column field="presupuesto.monto" header="Monto entregado" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.presupuesto?.monto }}
              </template>
            </Column>
            <Column field="descarga.gastos" header="Monto gastado" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.descarga?.gastos }}
              </template>
            </Column>
            <Column field="descarga.saldo" header="Saldo a devolver" style="width: 5%">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.descarga?.saldo }}
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

            <ColumnGroup type="footer">
              <Row>
                <Column footer="Monto a devolver:" :colspan="8" footerStyle="text-align:right" />
                <Column :footer="montoTotalDevolver" />
                <Column footer="" />
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>
      <div class="flex justify-content-center mt-4">
        <Button
          label="PROCESAR"
          icon="pi pi-check"
          @click="savePronuncioContador"
          :disabled="loading || !checkedRowsSelected.length"
          v-if="!loading"
        />
        <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
      </div>
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
