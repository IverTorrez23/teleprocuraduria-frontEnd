<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type OpcionFiltro = 'hoy' | 'ayer' | 'mes_actual' | 'rango' | `month_${number}`

// nombres de meses (0 = enero, 11 = diciembre)
const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

// opción seleccionada por defecto: "Hoy"
const selectedOption = ref<OpcionFiltro>('hoy')

const dateRange = ref<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null
})

const emit = defineEmits<{
  (e: 'filtrar', payload: { desde: Date; hasta: Date }): void
}>()

// 🔹 Opciones del filtro (dinámicas según fecha del sistema)
const options = computed(() => {
  const hoy = new Date()
  const currentMonthIndex = hoy.getMonth() // 0..11

  const dynamicMonths: { label: string; value: OpcionFiltro }[] = []

  // ⬅️ IMPORTANTE: empezamos DESDE el mes anterior al actual
  for (let m = currentMonthIndex - 1; m >= 0; m--) {
    dynamicMonths.push({
      label: monthNames[m],
      value: `month_${m}` as OpcionFiltro
    })
  }

  return [
    { label: 'Hoy', value: 'hoy' as OpcionFiltro },
    { label: 'Ayer', value: 'ayer' as OpcionFiltro },
    {
      label: `Mes actual (${monthNames[currentMonthIndex]})`,
      value: 'mes_actual' as OpcionFiltro
    },
    ...dynamicMonths,
    { label: 'Rango personalizado', value: 'rango' as OpcionFiltro }
  ]
})

// Cuando cambia la opción
const onOptionChange = () => {
  if (selectedOption.value !== 'rango') {
    const rango = calcularRango(selectedOption.value)
    emit('filtrar', rango)
  }
}

// Emitir rango personalizado
const emitirFiltro = () => {
  if (dateRange.value.start && dateRange.value.end) {
    emit('filtrar', {
      desde: dateRange.value.start,
      hasta: dateRange.value.end
    })
  }
}

// Calcular fechas según la opción seleccionada
function calcularRango(tipo: OpcionFiltro) {
  const hoy = new Date()
  const inicio = new Date(hoy)
  const fin = new Date(hoy)

  switch (tipo) {
    case 'hoy':
      return { desde: hoy, hasta: hoy }

    case 'ayer':
      inicio.setDate(hoy.getDate() - 1)
      fin.setDate(hoy.getDate() - 1)
      return { desde: inicio, hasta: fin }

    case 'mes_actual':
      inicio.setDate(1)
      fin.setMonth(hoy.getMonth() + 1, 0)
      return { desde: inicio, hasta: fin }

    default:
      if (tipo.startsWith('month_')) {
        const mesIndex = Number(tipo.split('_')[1]) // 0..11
        const year = hoy.getFullYear()
        const inicioMes = new Date(year, mesIndex, 1)
        const finMes = new Date(year, mesIndex + 1, 0)
        return { desde: inicioMes, hasta: finMes }
      }
      return { desde: hoy, hasta: hoy }
  }
}

onMounted(() => {
  onOptionChange()
})
</script>

<template>
  <div class="flex flex-col md:flex-row gap-3 items-center">
    <div class="field">
      <label for="Filtrado">Filtrado:</label>
      <Dropdown
        v-model="selectedOption"
        :options="options"
        optionLabel="label"
        optionValue="value"
        placeholder="Filtrar por fecha"
        @change="onOptionChange"
      />
    </div>

    <div class="field">
      <div v-if="selectedOption === 'rango'" class="flex items-center gap-2">
        <Calendar v-model="dateRange.start" showIcon placeholder="Desde" dateFormat="dd/mm/yy" />
        <Calendar v-model="dateRange.end" showIcon placeholder="Hasta" dateFormat="dd/mm/yy" />
        <Button
          label="Aplicar"
          icon="pi pi-check"
          class="p-button-sm p-button-primary"
          @click="emitirFiltro"
        />
      </div>
    </div>
  </div>
</template>
