<script setup lang="ts">
import type { IOrden } from '../../Ordenes/types/orden.types'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { TableSize } from '@/constants/constants'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import usuarioService from '../../Usuarios/services/usuario.service'
import type { IPresupuesto } from '../types/presupuesto.types'
import presupuestoService from '../services/presupuesto.service'
import ordenService from '../../Ordenes/services/orden.service'

const toast = useToast()

const selectedProcurador = ref(0)
const ordenes = ref<IOrden[]>([])
const submitted = ref(false)

const procuradores = ref<IUsuario[]>([])
const loading = ref(false)

const loadOrdenesEntregaPresupuesto = async (id: number) => {
  const response = await ordenService.listarParaEntregarPresupuesto(id)
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

  if (result.success) {
    procuradores.value =
      result.data?.map((procurador) => ({
        ...procurador,
        nombreCompleto: `${procurador.persona?.nombre || ''} ${procurador.persona?.apellido || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.error || 'No se pudieron obtener los procuradores.',
      life: 3000
    })
  }
}

onMounted(() => {
  loadProcuradores()
})

const saveEntregaPresupuesto = async () => {
  submitted.value = true
  if (checkedRows.value.length < 1) return
  loading.value = true
  try {
    const presupuestosSeleccionados: IPresupuesto[] = checkedRows.value
      .map((orden) => orden.presupuesto)
      .filter((p): p is IPresupuesto => !!p) // Filtra null/undefined y asegura el tipo

    const result = await presupuestoService.entregarPresupuestosMasivo(presupuestosSeleccionados)

    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: result.message,
      life: 3000
    })
    await resetValoresDeTabla()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al entregar presupuesto',
      life: 8000
    })
  } finally {
    loading.value = false
  }
}
let total = 0
const montoTotal = ref('0')
const checkedRows = ref<IOrden[]>([])
const obtenerListadoOrden = async (procuradorId: number) => {
  await resetValoresDeTabla()
  await loadOrdenesEntregaPresupuesto(procuradorId)
}

const resetValoresDeTabla = async () => {
  total = 0
  montoTotal.value = '0'
  checkedRows.value = []
  ordenes.value = []
}

const handleCheckChange = (data: any) => {
  const index = checkedRows.value.indexOf(data)
  const monto = data.presupuesto?.monto || 0
  if (index === -1) {
    // Si no está en el array, agregar la fila seleccionada y sumar el monto
    checkedRows.value.push(data)
    //montoTotal.value += monto
    total += parseFloat(monto)
  } else {
    // Si ya está en el array, remover la fila y restar el monto
    checkedRows.value.splice(index, 1)
    //montoTotal.value -= monto
    total -= parseFloat(monto)
  }
  montoTotal.value = `${total.toFixed(2)}`
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
            resizableColumns
            columnResizeMode="fit"
            showGridlines
            :size="TableSize.small"
            tableStyle="min-width: 50rem"
          >
            <Column field="codigo" header="Codigo Causa">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.causa?.materia?.abreviatura }}-{{
                  slotPropsOrden.data?.causa?.tipo_legal?.abreviatura
                }}-{{ slotPropsOrden.data?.causa?.id }}
              </template></Column
            >
            <Column field="id" header="Número Orden">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.id }}
              </template></Column
            >
            <Column field="presupuesto.monto" header="Presupuesto">
              <template #body="slotPropsOrden">
                {{ slotPropsOrden.data?.presupuesto?.monto }}
              </template>
            </Column>
            <Column field="select" header="Seleccionar">
              <template #body="slotPropsOrden">
                <Checkbox
                  :model-value="checkedRows.includes(slotPropsOrden.data)"
                  :value="slotPropsOrden.data"
                  binary
                  @update:model-value="handleCheckChange(slotPropsOrden.data)"
                /> </template
            ></Column>

            <ColumnGroup type="footer">
              <Row>
                <Column footer="Monto a entregar:" :colspan="2" footerStyle="text-align:right" />
                <Column :footer="montoTotal" />
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
          @click="saveEntregaPresupuesto"
          :disabled="loading || !checkedRows.length"
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
