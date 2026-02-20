<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'

import causaService from '../services/causa.service'

import type { ICausa } from '../types/causa.types'
import { TableSize } from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'

const toast = useToast()
const dt = ref()
const causasSaldosTerminados = ref<ICausa[]>([])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})


const loadCausasSaldosTerminados = async () => {
  const response = await causaService.listadoSaldosTerminadosCausas()

  if (response) {
    // Recorrer causas y agregar el dinero comprometido
    causasSaldosTerminados.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener causas saldos terminados',
      life: 3000
    })
  }
}

onMounted(() => {
  loadCausasSaldosTerminados()
})
watch(
  () => filters.value.global.value,
  () => {
    loadCausasSaldosTerminados()
  }
)


const modalTexCompletoVisible = ref(false)
const fullText = ref('')
const headerTextoCompleto = ref('')
const textMayorLimiteVisual = (html: string, limite: number) => {
  const text = html.replace(/<[^>]+>/g, '')
  if (text.length > limite) return true
  else return false
}
const truncateHTML = (html: string, length: number) => {
  const text = html.replace(/<[^>]+>/g, '') // Remueve las etiquetas HTML para obtener texto plano
  text.slice(0, length) // Trunca el texto plano dejando solamente la cantidad de caracteres segun length
  const isTruncated = text.length > length
  let finalHTML = ''
  let charCount = 0

  const regex = /(<[^>]+>|[^<]+)/g // Match tags or text
  let match
  while ((match = regex.exec(html)) !== null && charCount < length) {
    const part = match[0]

    if (part.startsWith('<')) {
      // Si es una etiqueta HTML, la agregamos sin modificar
      finalHTML += part
    } else {
      // Si es texto, lo truncamos si excede el límite
      const remainingChars = length - charCount
      finalHTML += part.slice(0, remainingChars)
      charCount += part.length
    }
  }
  if (isTruncated) {
    finalHTML += '...'
  }
  return finalHTML
}
const viewTextCompleto = (text: string, headerModal: string) => {
  fullText.value = text
  modalTexCompletoVisible.value = true
  headerTextoCompleto.value = headerModal
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />

        <DataTable
          ref="dt"
          :value="causasSaldosTerminados"
          dataKey="id"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <h4 class="m-1">Causas con Saldos Terminados</h4>

          <template #empty> No se encontraron registros. </template>
          <template #loading> Cargando los registros... </template>
          <Column field="codigo" header="Código" sortable style="min-width: 9rem">
            <template #body="slotProps">
              {{
                `${slotProps.data.materia.abreviatura}-${slotProps.data.tipo_legal.abreviatura}-${slotProps.data.id}`
              }}
            </template>
          </Column>

          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Id</span>
              {{ slotProps.data.nombre }}
            </template></Column
          >
          <Column field="usuario" header="Usuario" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Usuario</span>
              {{ slotProps.data.usuario.persona.nombre }}
            </template></Column
          >
          <Column field="usuario.persona.direccion" header="Direccion" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Direccion</span>
              {{ slotProps.data.usuario.persona.direccion }}
            </template></Column
          >
          <Column field="usuario.persona.telefono" header="Telefono" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Telefono</span>
              {{ slotProps.data.usuario.persona.telefono }}
            </template></Column
          >
          <Column field="usuario.email" header="Correo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Correo</span>
              {{ slotProps.data.usuario.email }}
            </template></Column
          >
          <Column field="usuario.persona.coordenadas" header="Coordenadas" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Coordenadas</span>
              {{ slotProps.data.usuario.persona.coordenadas }}
            </template></Column
          >
          <Column field="billetera" header="Saldo" sortable>
            <template #body="slotProps">
              <span class="p-column-title">Saldo</span>
              {{ slotProps.data.billetera }}
            </template></Column
          >
          <Column field="observacion" header="Observación" sortable style="min-width: 12rem">
            <template #body="slotProps">
              <span v-html="truncateHTML(slotProps.data.observacion, 100)"></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.observacion, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.observacion, 'Observación')"
              /> </template
          ></Column>
        </DataTable>

        
      </div>
    </div>
  </div>

  <OVisorTextCompleto
    :fullText="fullText"
    :visible="modalTexCompletoVisible"
    @update:visible="modalTexCompletoVisible = $event"
    :header="headerTextoCompleto"
  />
</template>
<style scoped lang="scss"></style>
