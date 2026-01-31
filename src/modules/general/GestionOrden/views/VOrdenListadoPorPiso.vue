<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import CausaService from '../../Causas/services/causa.service'
import type { ICausa } from '../../Causas/types/causa.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'

import {
  TableSize,
  TipoUsuario,
  EstadosCausas
} from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import { isAbogadoAutorizado } from '@/common/utils/usuarioAutorizado'
import useItemsContadorOrden from '@/common/utils/useItemsContadorOrden'
import OBotonesSeguimiento from '@/common/components/BotonesSeguimiento/OBotonesSeguimiento.vue'
import OBotonesSeguimientoLider from '@/common/components/BotonesSeguimiento/OBotonesSeguimientoLider.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
import { devuelveCodigoOrdenUrgencias } from '@/common/utils/devuelveCodigoOrdenUrgencias'
import type { IGestionOrden } from '../types/gestionOrden.types'
import gestionOrdenService from '../services/gestionOrden.service'

const route = useRoute()
const orderby = route.query.orderby

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

const toast = useToast()
const dt = ref()
const causas = ref<ICausa[]>([])


const selectedCausas = ref<ICausa[]>([])

const gestionOrden = ref<IGestionOrden[]>([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const pagination = ref<IPaginado>({
  rowsPerPage: 10,
  rowsNumber: 0,
  totalItems: 0,
  itemCount: 0,
  perPage: 10,
  currentPage: 1
})

const loadCausas = async (event?: DataTableSortEvent) => {
  const page = event ? event.first / event.rows + 1 : pagination.value.currentPage
  const perPage = event ? event.rows : pagination.value.rowsPerPage
  const search: ISearch[] = filters.value.global.value
    ? [{ fields: ['nombre', 'observacion'], keyword: filters.value.global.value }]
    : []
  const sort: ISort[] =
    event && event.sortField
      ? [
          {
            field: typeof event.sortField === 'string' ? event.sortField : '',
            orderType: event.sortOrder === 1 ? 'ASC' : 'DESC'
          }
        ]
      : []
  const opciones: IOpcionesPaginado = {
    page: page,
    perPage: perPage,
    search: search,
    sort: sort
  }
  const response = await CausaService.getCausas(opciones)

  causas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

const loadOrdenPorPisos = async () => {
  const result = await gestionOrdenService.listadoPorPisos()
  console.log('result.data', result)
  if (result.data) {
    gestionOrden.value =
      result.data?.map((orden) => ({
        ...orden,
        codigoCausa: `${orden?.causa?.materia?.abreviatura || ''}-${orden?.causa?.tipo_legal?.abreviatura || ''}-${orden?.causa?.id || ''}`
      })) || []
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las ordenes.',
      life: 3000
    })
  }
}

const { loadCantidadEtapasOrden } = useItemsContadorOrden()

onMounted(() => {
  loadOrdenPorPisos()
  loadCausas()
  loadCantidadEtapasOrden()
  console.log('Valor de orderby:', orderby)
})
watch(
  () => filters.value.global.value,
  () => {
    loadCausas()
  }
)

watch(
  () => route.query.orderby,
  (newOrderby) => {
    console.log('El valor de orderby cambió a:', newOrderby)
  }
)



//Para visualizacion de textos completos
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
  <OBotonesSeguimiento />
  <OBotonesSeguimientoLider v-if="usuario?.tipo === TipoUsuario.ABOGADO_LIDER" />
  <div class="card p-3">
    <Toast />
    <Toolbar class="mb-4" v-if="isAbogadoAutorizado">
      <template #start>
        <Button icon="pi pi-fw pi-print" severity="contrast" class="mr-2" />
      </template>
    </Toolbar>
    

    <DataTable
      ref="dt"
      :value="gestionOrden"
      v-model:selection="selectedCausas"
      dataKey="id"
      :paginator="false"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} causas"
      :autoLayout="true"
      :lazy="true"
      :size="TableSize.small"
    >
      <template #header>
        <div>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Listado Paracaidas</h4>

          </div>
        </div>
      </template>

      <template #empty> No se encontraron registros. </template>
      <template #loading> Cargando los registros... </template>

      <Column field="codigo" header="Código"  style="min-width: 9rem">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.causa.materia.abreviatura}-${slotProps.data.causa.tipo_legal.abreviatura}-${slotProps.data.causa.id}`"
            link
            @click="$router.push({ path: '/causas/ficha/' + slotProps.data.causa.id })"
          />

          <div>
            <span
            v-html="'('+ devuelveCodigoOrdenUrgencias(
                  slotProps.data.fecha_fin,
                  slotProps.data.prioridad,
                  slotProps.data.id,
                  slotProps.data.causa_id
                )+')'"
            ></span>
            <a
              :href="`/causas/ficha/lista-ordenes/${slotProps.data.causa.id}/detalle-orden/${slotProps.data.id}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              
              {{ slotProps.data.causa.tribunales[0]?.juzgado?.piso?.nombre || 'X' }}
              {{'('+ slotProps.data.id +')'}} 
            </a>
          </div>
        </template>
      </Column>

      <Column field="nombre" header="Nombre" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.causa.nombre }}
        </template></Column
      >


      <Column
        v-if="
          usuario?.tipo != TipoUsuario.ABOGADO_INDEPENDIENTE &&
          usuario?.tipo != TipoUsuario.ABOGADO_DEPENDIENTE
        "
        field="abogado"
        header="Abogado"
        style="min-width: 10rem"
      >
        <template #body="slotProps">
          {{ slotProps.data.causa.abogado.persona.nombre }}
          {{ slotProps.data.causa.abogado.persona.apellido }}
        </template></Column
      > 
      <Column field="categoria" header="Sector" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.causa.categoria.nombre }}
        </template></Column
      >
      <Column
        v-if="usuario?.tipo != TipoUsuario.PROCURADOR"
        field="procurador"
        header="Procurador"
        style="min-width: 10rem"
      >
        <template #body="slotProps">
          {{ slotProps.data.causa.procurador.persona.nombre }}
          {{ slotProps.data.causa.procurador.persona.apellido }}
        </template></Column
      >
      <Column field="observacion" header="Observación" style="min-width: 12rem">
        <template #body="slotProps">
          <span v-html="truncateHTML(slotProps.data.causa.observacion, 100)"></span>
          <Button
            v-if="textMayorLimiteVisual(slotProps.data.causa.observacion, 100)"
            label="Ver más"
            link
            @click="viewTextCompleto(slotProps.data.causa.observacion, 'Observación')"
          /> </template
      ></Column>
      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag :value="slotProps.data.causa.estado" :severity="getEstado(slotProps.data.causa.estado)" />
          <small
            v-if="slotProps.data.causa.estado === EstadosCausas.BLOQUEADA"
            style="font-size: 0.75rem; color: black"
          >
            {{ slotProps.data.causa.motivo_congelada }}</small
          ></template
        ></Column
      >
    </DataTable>
  </div>
  <OVisorTextCompleto
    :fullText="fullText"
    :visible="modalTexCompletoVisible"
    @update:visible="modalTexCompletoVisible = $event"
    :header="headerTextoCompleto"
  />
</template>
<style scoped lang="scss">
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
  margin-top: 1rem;
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

.badge {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  padding: 0.3em 0.6em;
  font-size: 0.8em;
  margin-left: 0.5em;
  display: inline-block;
  min-width: 20px;
  text-align: center;
}
.menu-item {
  margin-right: 5px;
  margin-left: 5px;
  cursor: pointer;
}

/* Estilo opcional para espaciado entre botones */
.mr-2 {
  margin-right: 0.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}

.custom-div {
  padding: 5px;
}

.dropdown-spacing {
  margin-right: 1rem;
}

.dropdown-spacing:last-child {
  margin-right: 0; /* Sin margen en el último elemento */
}
/*Estilos para el bloqueo del formulario y loading */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7); /* Fondo blanco con transparencia */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 10px; /* Asegura que siga la forma del modal */
}

.loading-icon {
  font-size: 4rem;
  color: #10b981;
}
</style>
