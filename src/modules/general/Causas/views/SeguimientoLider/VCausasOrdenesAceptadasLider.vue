<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import causaService from '../../services/causa.service'
import type { ICausa } from '../../types/causa.types'
import type { IOpcionesPaginado, IPaginado, ISearch, ISort } from '@/common/common.types'
import { getEstado } from '@/common/utils/statusUtils'
import type { DataTableSortEvent } from 'primevue/datatable'
import { TableSize } from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import useItemsContadorOrden from '@/common/utils/useItemsContadorOrden'
import OBotonesSeguimientoLider from '@/common/components/BotonesSeguimiento/OBotonesSeguimientoLider.vue'

const dt = ref()
const causas = ref<ICausa[]>([])
const { loadCantidadEtapasOrden } = useItemsContadorOrden()

const selectedCausas = ref<ICausa[]>([])
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
  const response = await causaService.getCausasOrdenAceptadasDeLider(opciones)

  causas.value = response.result
  pagination.value.rowsNumber = response.pagination.rowsNumber
  pagination.value.totalItems = response.pagination.totalItems
  pagination.value.itemCount = response.pagination.itemCount
  pagination.value.rowsPerPage = response.pagination.rowsPerPage
  pagination.value.currentPage = response.pagination.currentPage
}

onMounted(() => {
  loadCausas()
  loadCantidadEtapasOrden()
})
watch(
  () => filters.value.global.value,
  () => {
    loadCausas()
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
  <OBotonesSeguimientoLider/>
  <div class="card p-3">
    <Toast />

    <DataTable
      ref="dt"
      :value="causas"
      v-model:selection="selectedCausas"
      dataKey="id"
      :paginator="true"
      :rows="pagination.rowsPerPage"
      :totalRecords="pagination.totalItems"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} causas"
      :autoLayout="true"
      :lazy="true"
      :size="TableSize.small"
      @page="loadCausas"
      @sort="loadCausas"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Causas Con ordenes Info/Doc entregados</h4>

          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters.global.value" placeholder="Buscar..." />
          </IconField>
        </div>
      </template>
      <template #empty> No se encontraron registros. </template>
      <template #loading> Cargando los registros... </template>

      <Column field="id" header="ID" sortable style="min-width: 3rem"></Column>
      <Column field="codigo" header="Código" sortable style="min-width: 9rem">
        <template #body="slotProps">
          <Button
            :label="`${slotProps.data.materia.abreviatura}-${slotProps.data.tipo_legal.abreviatura}-${slotProps.data.id}`"
            link
            @click="$router.push({ name: 'OrdenesInfoDocEntregadosLider', params: { idCausa: slotProps.data.id } })"
          />
        </template>
      </Column>

      <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>

      <Column field="abogado" header="Abogado" style="min-width: 10rem">
        <template #body="slotProps">
          {{ slotProps.data.abogado.persona.nombre }}
          {{ slotProps.data.abogado.persona.apellido }}
        </template></Column
      >
      <Column field="procurador" header="Procurador" style="min-width: 10rem">
        <template #body="slotProps">
          {{ slotProps.data.procurador.persona.nombre }}
          {{ slotProps.data.procurador.persona.apellido }}
        </template></Column
      >

      <Column field="categoria" header="Sector" style="min-width: 8rem">
        <template #body="slotProps">
          {{ slotProps.data.categoria.nombre }}
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

      <Column field="estado" header="Estado" style="min-width: 6rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado"
            :severity="getEstado(slotProps.data.estado)"
          /> </template
      ></Column>
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
</style>
