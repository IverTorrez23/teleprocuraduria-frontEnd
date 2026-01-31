<script setup lang="ts">
import { ref, onMounted, watch,onUnmounted } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'

import type { ICompraPaquete } from '../../CompraPaquete/types/compraPaquete.types'
import compraPaqueteService from '../../CompraPaquete/services/compraPaquete.service'
import { TableSize } from '@/constants/constants'
import type { ICausa } from '../../Causas/types/causa.types'
import causaService from '../../Causas/services/causa.service'
import type { IParametroVigencia } from '../../ParametroVigencias/types/parametroVigencias.types'
import parametroVigenciasService from '../../ParametroVigencias/services/parametroVigencias.service'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

const toast = useToast()

const parametroVigencia = ref<IParametroVigencia>()
const totalCausasConPaquete = ref(0)
const totalCausasSinPaquete = ref(0)
const totalDiasDeCreditoDePaquete = ref(0)

const causasSinPaquete = ref<ICausa[]>([])

const compraPaquetes = ref<ICompraPaquete[]>([])
const loadPaqueteCompradosDeUsuario = async () => {
  totalCausasConPaquete.value = 0

  const response = await compraPaqueteService.listadoActivosPorUsuario()
  if (response && response.length) {
    compraPaquetes.value = response.map((compraPaquete) => {
      const paqueteCausasLength = Array.isArray(compraPaquete.paquete_causas)
        ? compraPaquete.paquete_causas.length
        : 0 // Si no es un array, asignamos 0
      totalCausasConPaquete.value = totalCausasConPaquete.value + paqueteCausasLength
      const currentDate = new Date()
      const fechaFinVigencia = new Date(compraPaquete.fecha_fin_vigencia)
      // Convertir ambas fechas a solo la parte de la fecha
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      )
      const endDateOnly = new Date(
        fechaFinVigencia.getFullYear(),
        fechaFinVigencia.getMonth(),
        fechaFinVigencia.getDate()
      )

      // Calcular la diferencia en milisegundos y luego convertir a días
      const timeDiff = endDateOnly.getTime() - currentDateOnly.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      return {
        ...compraPaquete,
        diasRestantesVigentes: daysDiff > 0 ? daysDiff : 0
      }
    })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Ups',
      detail: 'No hay paquetes comprados',
      life: 3000
    })
  }
}

const devuelveDiasDiferencia = (fechaInicio: string, fechaFin: string): number => {
  const inicio = dayjs(fechaInicio)
  const fin = dayjs(fechaFin)
  return fin.diff(inicio, 'day') // Calcula la diferencia en días
}
const contador = ref('') // Texto que muestra el cronómetro
let intervalId: ReturnType<typeof setInterval>
  const actualizarContador = () => {
  if (parametroVigencia.value?.fecha_ultima_vigencia) {
    const ahora = dayjs()
    const fechaObjetivo = dayjs(parametroVigencia.value.fecha_ultima_vigencia)
    const diff = fechaObjetivo.diff(ahora)

    if (diff > 0) {
      const duracion = dayjs.duration(diff)
      const meses = duracion.months()
      const dias = duracion.days()
      const horas = duracion.hours()
      const minutos = duracion.minutes()
      const segundos = duracion.seconds()
      const mesesVar=ref('')
      if(meses>0)
    {
      mesesVar.value =`${meses}mes`
    }
      contador.value = `${mesesVar.value} ${dias}d ${horas}h ${minutos}m ${segundos}s`
    } else {
      contador.value = 'Vigencia finalizada'
      clearInterval(intervalId)
    }
  }
}

const loadParametroVigencia = async () => {
  const response = await parametroVigenciasService.obtenerParametroVigencia()
  if (response) {
    parametroVigencia.value = response
    const fechaActual = dayjs().format('YYYY-MM-DD HH:mm:ss')
    //Calculos para obtener la cantidad de dias vigente que tiene el usuario
    if (parametroVigencia.value.fecha_ultima_vigencia > fechaActual) {
      totalDiasDeCreditoDePaquete.value = devuelveDiasDiferencia(
        fechaActual,
        parametroVigencia.value?.fecha_ultima_vigencia
      )
      actualizarContador() // Inicializar inmediatamente
    intervalId = setInterval(actualizarContador, 1000) // Actualizar cada segundo
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener Vigencia General',
      life: 3000
    })
  }
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})


const loadCausasSinPaquete = async () => {
  const response = await causaService.listadoSinPaquete()
  if (response) {
    causasSinPaquete.value = response
    totalCausasSinPaquete.value = causasSinPaquete.value.length
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Causas sin Paquetes',
      life: 3000
    })
  }
}

onMounted(() => {
  loadPaqueteCompradosDeUsuario()
  loadCausasSinPaquete()
  loadParametroVigencia()
})
watch(
  () => filters.value.global.value,
  () => {}
)
onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <p>PAQUETES VIGENTES</p>
        <DataTable
          ref="dt2"
          dataKey="id"
          :value="compraPaquetes"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="id" header="ID">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">ID</span>
              {{ slotPropsPaqueteCompra?.data?.id }}
            </template></Column
          >
          <Column field="paquete" header="Nombre del Paquete">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Paquete</span>
              {{ slotPropsPaqueteCompra?.data?.paquete?.nombre }}
            </template></Column
          >
          <Column field="fecha_compra" header="Fecha compra">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Fecha compra</span>
              {{ slotPropsPaqueteCompra?.data?.fecha_compra }}
            </template></Column
          >
          <Column field="dias_vigente" header="Días de vigencia">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Días de vigencia</span>
              {{ slotPropsPaqueteCompra?.data?.dias_vigente }}
            </template></Column
          >

          <Column field="fecha_ini_vigencia" header="Fecha inicio vigencia">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Fecha inicio vigencia</span>
              {{ slotPropsPaqueteCompra?.data?.fecha_ini_vigencia }}
            </template></Column
          >

          <Column field="fecha_fin_vigencia" header="Fecha fin vigencia">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Fecha final vigencia</span>
              {{ slotPropsPaqueteCompra?.data?.fecha_fin_vigencia }}
            </template></Column
          >
          <Column field="fecha_fin_vigencia" header="Dias Restantes">
            <template #body="slotPropsPaqueteCompra">
              <span class="p-column-title">Dias Restantes</span>
              <span
                :class="[
                  'tag-span',
                  slotPropsPaqueteCompra?.data?.diasRestantesVigentes > 5
                    ? 'tag-success'
                    : 'tag-danger'
                ]"
              >
                {{ slotPropsPaqueteCompra?.data?.diasRestantesVigentes }}
              </span>
            </template></Column
          >
        </DataTable>
        <br />
        <Tag :value="'Total dís de crédito : ' + contador" severity="info" />
        &nbsp;
        <Tag
          v-if="parametroVigencia?.fecha_ultima_vigencia"
          :value="'Fecha de vencimiento : ' + parametroVigencia?.fecha_ultima_vigencia"
          severity="info"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.tag-span {
  display: inline-block;
  padding: 0.15em 0.4em;
  font-size: 95%;
  font-weight: 500; /* Negrita */
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.tag-success {
  background-color: #28a745;
}

.tag-danger {
  background-color: #dc3545;
}
</style>
