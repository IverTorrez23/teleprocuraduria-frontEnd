<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import matrizCotizacionService from '../services/matrizCotizacion.service'
import type { IMatrizCotizacion } from '../types/matrizCotizacion.types'

const toast = useToast()

const isLoading = ref(false)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const submitted = ref(false)

const createMatrizCotizacion =(): IMatrizCotizacion => {
  return {
    id: 0,
    numero_prioridad: 1,
    precio_compra: 0,
    precio_venta: 0,
    penalizacion: 0,
    condicion: 1,
    estado: '',
    es_eliminado: 0,
    created_at: '',
    updated_at: ''
  };
}
//Condicion 1
const matrizPri1Cond1 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond1 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond1 = ref<IMatrizCotizacion>(createMatrizCotizacion())
//Condicion 2
const matrizPri1Cond2 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond2 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond2 = ref<IMatrizCotizacion>(createMatrizCotizacion())
//Condicion 3
const matrizPri1Cond3 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond3 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond3 = ref<IMatrizCotizacion>(createMatrizCotizacion())
//Condicion 4
const matrizPri1Cond4 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond4 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond4 = ref<IMatrizCotizacion>(createMatrizCotizacion())
//Condicion 5
const matrizPri1Cond5 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond5 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond5 = ref<IMatrizCotizacion>(createMatrizCotizacion())
//Condicion 6
const matrizPri1Cond6 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri2Cond6 = ref<IMatrizCotizacion>(createMatrizCotizacion())
const matrizPri3Cond6 = ref<IMatrizCotizacion>(createMatrizCotizacion())

const loadUnaMatrizPorPrioridadCondicion = async () => {
  isLoading.value = true
//Condicion 1
  const response = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,1)
  const responseP2C1 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,1)
  const responseP3C1 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,1)
//Condicion 2
  const responseP1C2 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,2)
  const responseP2C2 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,2)
  const responseP3C2 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,2)
//Condicion 3
  const responseP1C3 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,3)
  const responseP2C3 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,3)
  const responseP3C3 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,3)
//Condicion 4
  const responseP1C4 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,4)
  const responseP2C4 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,4)
  const responseP3C4 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,4)
//Condicion 5
 const responseP1C5 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,5)
 const responseP2C5 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,5)
 const responseP3C5 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,5)
//Condicion 6
 const responseP1C6 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(1,6)
 const responseP2C6 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(2,6)
 const responseP3C6 = await matrizCotizacionService.obtenerMatrizPorPrioridadCondicion(3,6)

  if (response &&
    responseP2C1 &&
    responseP3C1 &&
    responseP1C2 &&
    responseP2C2 &&
    responseP3C2 &&
    responseP1C3 &&
    responseP2C3 &&
    responseP3C3 &&
    responseP1C4 &&
    responseP2C4 &&
    responseP3C4 &&
    responseP1C5 &&
    responseP2C5 &&
    responseP3C5 &&
    responseP1C6 &&
    responseP2C6 &&
    responseP3C6) {
  //Condicion 1
    matrizPri1Cond1.value = response
    matrizPri2Cond1.value = responseP2C1
    matrizPri3Cond1.value = responseP3C1
  //Condicion 2
    matrizPri1Cond2.value = responseP1C2
    matrizPri2Cond2.value = responseP2C2
    matrizPri3Cond2.value = responseP3C2
  //Condicion 3
    matrizPri1Cond3.value = responseP1C3
    matrizPri2Cond3.value = responseP2C3
    matrizPri3Cond3.value = responseP3C3
  //Condicion 4
    matrizPri1Cond4.value = responseP1C4
    matrizPri2Cond4.value = responseP2C4
    matrizPri3Cond4.value = responseP3C4
  //Condicion 5
    matrizPri1Cond5.value = responseP1C5
    matrizPri2Cond5.value = responseP2C5
    matrizPri3Cond5.value = responseP3C5
  //Condicion 6
    matrizPri1Cond6.value = responseP1C6
    matrizPri2Cond6.value = responseP2C6
    matrizPri3Cond6.value = responseP3C6

    isLoading.value = false
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener matriz prioridad 1 condicion 1',
      life: 3000
    })
  }
}
onMounted(() => {
  loadUnaMatrizPorPrioridadCondicion()
})
watch(
  () => filters.value.global.value,
  () => {
    loadUnaMatrizPorPrioridadCondicion()
  }
)

const saveMatriz = async () => {
  isLoading.value = true
  submitted.value = true
  if (!matrizPri1Cond1.value?.id) return

  try {
    if (matrizPri1Cond1.value.id) {
      //Condicion 1
      await matrizCotizacionService.updateMatriz(matrizPri1Cond1.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond1.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond1.value)
      //Condicion 2
      await matrizCotizacionService.updateMatriz(matrizPri1Cond2.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond2.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond2.value)
      //Condicion 3
      await matrizCotizacionService.updateMatriz(matrizPri1Cond3.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond3.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond3.value)
      //Condicion 4
      await matrizCotizacionService.updateMatriz(matrizPri1Cond4.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond4.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond4.value)
      //Condicion 5
      await matrizCotizacionService.updateMatriz(matrizPri1Cond5.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond5.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond5.value)
      //Condicion 6
      await matrizCotizacionService.updateMatriz(matrizPri1Cond6.value)
      await matrizCotizacionService.updateMatriz(matrizPri2Cond6.value)
      await matrizCotizacionService.updateMatriz(matrizPri3Cond6.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Matriz Updated',
        life: 3000
      })
    } 
    loadUnaMatrizPorPrioridadCondicion()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save Matriz', life: 3000 })
  }finally {
        isLoading.value = false 
  }
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <h4>MATRIZ</h4>
        <!-- Tabla Matriz -->
        <table class="static-table">
          <thead>
            <tr id="fila1">
              <th id="tdorden" rowspan="2">CONDICION</th>
              <th id="tdorden" colspan="3">COMPRA DE PROCURADORIA</th>
              <th id="tdorden" colspan="3">VENTA DE PROCURADORIA</th>
              <th id="tdorden" colspan="3">PENALIZACION DE PROCURADORIA</th>
            </tr>
            <tr id="fila2">
              <th id="tdorden">BANDERA 1</th>
              <th id="tdorden">BANDERA 2</th>
              <th id="tdorden">BANDERA 3</th>
              <th id="tdorden">BANDERA 1</th>
              <th id="tdorden">BANDERA 2</th>
              <th id="tdorden">BANDERA 3</th>
              <th id="tdorden">BANDERA 1</th>
              <th id="tdorden">BANDERA 2</th>
              <th id="tdorden">BANDERA 3</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #d0e2d1">
            <!-- condicion 1 -->
              <td>mas de 96 horas</td>
              <td> <InputNumber v-model="matrizPri1Cond1.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond1.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond1.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond1.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond1.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond1.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond1.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond1.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond1.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>

            <tr style="background: #42a4d2">
            <!-- condicion 2 -->
              <td>de 24 a 96 horas</td>
              <td> <InputNumber v-model="matrizPri1Cond2.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond2.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond2.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond2.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond2.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond2.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond2.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond2.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond2.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>

            <tr style="background: #39b743">
            <!-- condicion 3 -->
              <td>de 8 a 24 horas</td>
              <td> <InputNumber v-model="matrizPri1Cond3.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond3.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond3.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond3.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond3.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond3.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond3.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond3.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond3.penalizacion"  id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>

            <tr style="background: #f5eb0f">
            <!-- condicion 4 -->
              <td>de 3 a 8 horas</td>
              <td> <InputNumber v-model="matrizPri1Cond4.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond4.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond4.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond4.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond4.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond4.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond4.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond4.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond4.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>

            <tr style="background: #f5860f">
            <!-- condicion 5 -->
              <td>de 1 a 3 horas</td>
              <td> <InputNumber v-model="matrizPri1Cond5.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond5.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond5.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond5.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond5.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond5.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond5.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond5.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond5.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>

            <tr style="background: red">
            <!-- condicion 6 -->
              <td>de 0 a 1 hora</td>
              <td> <InputNumber v-model="matrizPri1Cond6.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond6.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond6.precio_compra" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond6.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond6.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond6.precio_venta" id="nombre_numerico" class="small-input p-fluid"/></td>

              <td> <InputNumber v-model="matrizPri1Cond6.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri2Cond6.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
              <td> <InputNumber v-model="matrizPri3Cond6.penalizacion" id="nombre_numerico" class="small-input p-fluid"/></td>
            </tr>
          </tbody>
        </table>
        <br>
        <div class="button-container">
          <Button 
          :label="isLoading ? 'Actualizando...' : 'Actualizar'"
          :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          :disabled="isLoading"
          @click="saveMatriz"/>
        </div>
    
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* Estilo básico para la tabla */
.static-table {
  width: 100%;
  border-collapse: collapse;
}

.static-table th,
.static-table td {
  border: 1px solid #ccc;
  padding: 1px;
  text-align: center;
}

.static-table th {
  background-color: #f4f4f4;
}
table.static-table td {
  padding: 1px;
  width: 100px; 
}
.small-input {
    width: 65px !important; 
    padding: 4px !important; 
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
