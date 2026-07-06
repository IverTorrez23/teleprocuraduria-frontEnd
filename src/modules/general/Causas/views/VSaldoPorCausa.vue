<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'

import causaService from '../services/causa.service'

import type { ICausa } from '../types/causa.types'
import type { ICausaCodigo } from '../types/causa.types'
import { TableSize, EtapaOrden } from '@/constants/constants'
import OVisorTextCompleto from '@/components/OVisorTextCompleto.vue'
import CausaService from '../services/causa.service'
import ordenService from '../../Ordenes/services/orden.service'
import type { IDetalleFinanciero } from '../../Ordenes/types/orden.types'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import { useConfigStore } from '@/stores/configStore';
import { storeToRefs } from 'pinia';

const configStore = useConfigStore();
const { imgLogo } = storeToRefs(configStore);

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import htmlToPdfmake from 'html-to-pdfmake'
pdfMake.vfs = pdfFonts.vfs

const toast = useToast()
const dt = ref()
const causasSaldosActivos = ref<ICausa[]>([])
const codigoCausas = ref<ICausaCodigo[]>([])
const causaSeleccionada = ref<number | null>(null)
const causaSelected = ref<ICausa>()
const detalleFinanciero = ref<IDetalleFinanciero[]>([])
const logoBase64 = ref('')

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const loadUnaCausa = async (idCausa: number) => {
  try {
    const response = await CausaService.obtenerUnaCausa(idCausa)
    causaSelected.value = response

    return true
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Fallo al obtener una Causa',
      life: 8000
    })
    return false
  }
}

const loadCodigoCausas = async () => {
  const response = await causaService.getlistarCausasConCodigo()

  if (response.status === 'success') {
    // Recorrer causas y agregar el dinero comprometido
    codigoCausas.value = response.data ?? []
     
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: response.message || 'No se pudieron obtener las causas.',
      life: 3000
    })
  }
}
const loadDetalleFinancieroCausa = async (id: number) => {
  const result = await ordenService.listadoDetFinancieroCausa(id)

  if (result.data) {
    detalleFinanciero.value = result.data
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.errors || 'No se pudieron obtener las ordenes.',
      life: 3000
    })
  }
}

const selectedCausa = async (id: number) => {
  loadUnaCausa(id)
  loadDetalleFinancieroCausa(id)
}
onMounted(() => {
  loadCodigoCausas()
})
watch(
  () => filters.value.global.value,
  () => {}
)

const modalTexCompletoVisible = ref(false)
const fullText = ref('')
const headerTextoCompleto = ref('')
const textMayorLimiteVisual = (html: string, limite: number) => {
  if (!html) {
    return false
  }
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

const totalGastos = computed(() => {
  return detalleFinanciero.value.reduce((sum, item) => {
    return item.es_validado == 1 ? sum + Number(item.costo_procesal_venta || 0) : sum
  }, 0)
})

const totalProcuraduria = computed(() => {
  return detalleFinanciero.value.reduce((sum, item) => {
    return sum + Number(item.venta || 0)
  }, 0)
})

const totalEgreso = computed(() => {
  return detalleFinanciero.value.reduce((sum, item) => {
    if (item.etapa_orden == EtapaOrden.CERRADA && item.es_validado == 1) {
      return sum + Number(item.total_egreso || 0)
    }

    return sum
  }, 0)
})

const fechaActual = new Date().toLocaleDateString('es-BO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const textoFecha = `${fechaActual}`

const getBase64ImageFromURL = async (url: string) => {
  console.log('url', url)
  const data = await fetch(url)
  const blob = await data.blob()

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result as string)
  })
}


const generarPDF = async () => {
  //logoBase64.value = await getBase64ImageFromURL(imgLogo.value!)
  //console.log('logoBase64', logoBase64)
  
  const tabla1 = [
    [
      { text: 'Código', style: 'tableHeader' },
      { text: 'Nombre del Proceso', style: 'tableHeader' },
      { text: 'Abogado', style: 'tableHeader' },
      { text: 'Procurador', style: 'tableHeader' }
    ],
    [
      `${causaSelected.value?.materia?.abreviatura ?? ''}-${causaSelected.value?.tipo_legal?.abreviatura ?? ''}-${causaSelected.value?.id ?? ''}`,
      causaSelected.value?.nombre ?? '',
      `${causaSelected.value?.abogado?.persona?.nombre ?? ''} ${causaSelected.value?.abogado?.persona?.apellido ?? ''}`,
      `${causaSelected.value?.procurador?.persona?.nombre ?? ''} ${causaSelected.value?.procurador?.persona?.apellido ?? ''}`
    ]
  ]

  const limpiarHTML = (html: string) => {
    return html.replace(/font-family:[^;"]*;?/gi, '')
  }

  const tabla2 = [
    [
      { text: 'Orden', style: 'tableHeader' },
      { text: 'Bandera', style: 'tableHeader' },
      { text: 'Inicio', style: 'tableHeader' },
      { text: 'Fin', style: 'tableHeader' },
      { text: 'Orden Girada', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Gastos', style: 'tableHeader' },
      { text: 'Procuraduria', style: 'tableHeader' },
      { text: 'Total egreso', style: 'tableHeader' }
    ],
    ...detalleFinanciero.value.map((det) => [
      det.id,
      det.prioridad,
      det.fecha_inicio,
      det.fecha_fin,
      htmlToPdfmake(limpiarHTML(det.entrega_informacion || '')),
      htmlToPdfmake(limpiarHTML(det.detalle_informacion || '')),
      det.es_validado == 1 ? det.costo_procesal_venta : '??',
      det.etapa_orden == EtapaOrden.CERRADA ? det.venta : det.venta + ' - Por Confirmar',
      // Total egreso
      det.etapa_orden == EtapaOrden.CERRADA
        ? det.es_validado == 1
          ? det.total_egreso
          : `${det.venta} - Por ahora`
        : '??'
    ]),
    [
    {
      text: 'TOTAL',
      colSpan: 6,
      alignment: 'right',
      bold: true,
      fillColor: '#E5E7EB'
    },
    {},
    {},
    {},
    {},
    {},
    {
      text: totalGastos.value.toFixed(2),
      bold: true,
      alignment: 'right',
      fillColor: '#E5E7EB'
    },
    {
      text: totalProcuraduria.value.toFixed(2),
      bold: true,
      alignment: 'right',
      fillColor: '#E5E7EB'
    },
    {
      text: totalEgreso.value.toFixed(2),
      bold: true,
      alignment: 'right',
      fillColor: '#E5E7EB'
    }
  ]
  ]

  const docDefinition = {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [20, 60, 20, 30],
    header: {
    margin: [20, 10, 20, 10],
    columns: [
      /*{
        image: logoBase64,
        width: 80
      },*/
      {
        text: textoFecha,
        alignment: 'right',
        fontSize: 10,
        margin: [20, 15, 20, 0]
      }
    ]
  },
    content: [
      { text: 'INFORME DE AVANCE FINANCIERO', style: 'header' },

      { text: 'Datos de causa', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*'],
          body: tabla1
        },
        style: 'tabla1'
      },

      {
        text: 'EGRESOS (COSTOS PROCESALES). - Por su parte, los Costos Procesales realizados hasta la emision del presente informe, son los siguientes: EGRESOS POR COSTOS PROCESALES (Expresado en Bolivianos)',
        style: 'subheader',
        margin: [0, 20, 0, 8]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', '*', '*', 'auto', 'auto', 'auto'],
          body: tabla2
        },
        style: 'tabla2'
      }
    ],
    styles: {
      header: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 15]
      },
      subheader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 8]
      },
      tabla1: {
        fontSize: 8 // 👈 aquí defines el tamaño de letra para toda la tabla
      },
      tabla2: {
        fontSize: 8 // 👈 aquí defines el tamaño de letra para toda la tabla
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        //color: 'white',
        fillColor: '#E5E7EB',
        alignment: 'center'
      }
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'right',
      margin: [0, 0, 20, 0],
      fontSize: 8
    })
  }

  pdfMake.createPdf(docDefinition).open()
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <Toolbar class="mb-4">
          <template #start>
            <div class="my-2">
              <div class="field">
                
                <Dropdown
                  id="causa_id"
                  v-model="causaSeleccionada"
                  :options="codigoCausas"
                  optionLabel="codigo_causa"
                  optionValue="id"
                  filter
                  filterPlaceholder="Buscar Causa"
                  placeholder="Seleccione una causa"
                  @change="selectedCausa($event.value)"
                />
              </div>
            </div>
          </template>

          <template #end>
            <Button icon="pi pi-fw pi-print" severity="contrast" class="mr-2" @click="generarPDF" />
          </template>
        </Toolbar>

        <DataTable
          ref="dt2"
          dataKey="id"
          :value="[causaSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <h6 class="m-1">INFORME DE AVANCE FINANCIERO</h6>
          <Column field="codigo" header="Código">
            <template #body="">
              <span class="p-column-title">Nombre</span>
              {{ causaSelected?.materia?.abreviatura }}-{{
                causaSelected?.tipo_legal?.abreviatura
              }}-{{ causaSelected?.id }}
            </template></Column
          >
          <Column field="nombre" header="Nombre del Proceso">
            <template #body="">
              <span class="p-column-title">Nombre del Proceso</span>
              {{ causaSelected?.nombre }}
            </template></Column
          >
          <Column field="abogado" header="Abogado">
            <template #body="">
              <span class="p-column-title">Abogado</span>
              {{ causaSelected?.abogado?.persona?.nombre }}
              {{ causaSelected?.abogado?.persona?.apellido }}
            </template></Column
          >
          <Column field="procurador" header="Procurador">
            <template #body="">
              <span class="p-column-title">Abogado</span>
              {{ causaSelected?.procurador?.persona?.nombre }}
              {{ causaSelected?.procurador?.persona?.apellido }}
            </template></Column
          >
        </DataTable>

        <br />
        <DataTable
          ref="dt"
          :value="detalleFinanciero"
          dataKey="id"
          :paginator="false"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ordenes"
          :autoLayout="true"
          :lazy="true"
          :size="TableSize.small"
        >
          <template #header>
            <div>
              <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h6 class="m-1">
                  EGRESOS (COSTOS PROCESALES). - Por su parte, los Costos Procesales realizados
                  hasta la emision del presente informe, son los siguientes: EGRESOS POR COSTOS
                  PROCESALES (Expresado en Bolivianos)
                </h6>
              </div>
            </div>
          </template>

          <template #empty> No se encontraron registros. </template>
          <template #loading> Cargando los registros... </template>

          <!-- <Column field="id" header="Orden" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.id }}
            </template></Column
          > -->
          <Column field="id" header="Orden" style="min-width: 8rem">
            <template #body="slotProps">
              <Button
                :label="`${slotProps.data.id}`"
                link
                @click="
                  $router.push(
                    `/detalle-costos-operativos/${causaSeleccionada}/detalle-orden/` +
                      slotProps.data.id
                  )
                "
              />
            </template>
          </Column>
          <Column field="prioridad" header="Bandera" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.prioridad }}
            </template></Column
          >
          <Column field="fecha_inicio" header="Inicio" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.fecha_inicio }}
            </template></Column
          >
          <Column field="fecha_fin" header="Fin" style="min-width: 8rem">
            <template #body="slotProps">
              {{ slotProps.data.fecha_fin }}
            </template></Column
          >
          <Column field="entrega_informacion" header="Orden Girada" style="min-width: 8rem">
            <template #body="slotProps">
              <span
                v-if="slotProps.data.entrega_informacion"
                v-html="truncateHTML(slotProps.data.entrega_informacion, 100)"
              ></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.entrega_informacion, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.entrega_informacion, 'Carga Info.')"
              /> </template
          ></Column>
          <Column field="detalle_informacion" header="Resultado" style="min-width: 8rem">
            <template #body="slotProps">
              <span
                v-if="slotProps.data.detalle_informacion"
                v-html="truncateHTML(slotProps.data.detalle_informacion, 100)"
              ></span>
              <Button
                v-if="textMayorLimiteVisual(slotProps.data.detalle_informacion, 100)"
                label="Ver más"
                link
                @click="viewTextCompleto(slotProps.data.detalle_informacion, 'Descarga Info.')"
              /> </template
          ></Column>

          <Column field="costo_procesal_venta" header="Gastos" style="min-width: 8rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.es_validado == 1">{{
                slotProps.data.costo_procesal_venta
              }}</span>
              <span v-else>??</span>
            </template></Column
          >
          <Column field="venta" header="Procuraduria" style="min-width: 8rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.etapa_orden == EtapaOrden.CERRADA">{{
                slotProps.data.venta
              }}</span>
              <span v-else>{{ slotProps.data.venta }} - Por confirmar</span>
            </template></Column
          >
          <Column field="total_egreso" header="Toal egreso" style="min-width: 8rem">
            <template #body="slotProps">
              <span
                v-if="
                  slotProps.data.etapa_orden == EtapaOrden.CERRADA &&
                  slotProps.data.es_validado == 1
                "
                >{{ slotProps.data.total_egreso }}</span
              >
              <span
                v-if="
                  slotProps.data.etapa_orden == EtapaOrden.CERRADA &&
                  slotProps.data.es_validado == 0
                "
                >{{ slotProps.data.venta }} - Por ahora</span
              >
              <span v-if="slotProps.data.etapa_orden != EtapaOrden.CERRADA">??</span>
            </template></Column
          >

          <ColumnGroup type="footer">
            <Row>
              <Column
                footer="TOTAL GENERAL"
                :colspan="6"
                footerStyle="
        
        font-weight:bold;
        text-align:right;
      "
              />

              <Column
                :footer="totalGastos.toFixed(2)"
                footerStyle="
        
        font-weight:bold;
      "
              />

              <Column
                :footer="totalProcuraduria.toFixed(2)"
                footerStyle="
        
        font-weight:bold;
      "
              />

              <Column
                :footer="totalEgreso.toFixed(2)"
                footerStyle="
        
       
        font-weight:bold;
      "
              />
            </Row>
          </ColumnGroup>
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
