<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import detalleOrdenService from '../../Ordenes/DetalleOrden/services/detalleOrden.service'
import type { IOrden, IOrdenCodigo } from '../../Ordenes/types/orden.types'
import { onMounted, ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { formatCausaCodigo } from '@/common/utils/formatCausaCodigo'
import { TableSize, TinymceApiKey, TinymceConfig } from '@/constants/constants'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import tribunalService from '../../Tribunal/services/tribunal.service'
import type { ITribunal } from '../../Tribunal/types/tribunal.types'
import { baseUrlResource } from '@/config/constants'
import OVisorImg from '@/components/OVisorImg.vue'
import { PRIORIDAD } from '@/constants/orden'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import usuarioService from '../../Usuarios/services/usuario.service'
import type { IPresupuesto } from '../types/presupuesto.types'
import presupuestoService from '../services/presupuesto.service'
import type { ISugerenciaGasto } from '@/modules/admin/SugerenciaGastos/types/sugerenciaGasto.types'
import sugerenciaGastoService from '@/modules/admin/SugerenciaGastos/services/sugerenciaGasto.service'
import sugerenciaOrdenService from '@/modules/general/SugerenciaOrden/services/sugerenciaOrden.service'
import type { ISugerenciaOrden } from '@/modules/general/SugerenciaOrden/types/sugerenciaOrden.types'

const router = useRouter()
const toast = useToast()
const route = useRoute()
const idOrden = Number(route.params.idOrden)
const idCausa = ref(0)

const detalleOrden = ref<IOrden>()
const submitted = ref(false)

const tribunales = ref<ITribunal[]>([])
const procuradores = ref<IUsuario[]>([])
const loading = ref(false)
const sugerenciasPresupuesto = ref<ISugerenciaGasto[]>([])
const sugerenciasAplicadas = ref<ISugerenciaGasto[]>([])
const sugerenciaOrden = ref<ISugerenciaOrden[]>([])
const sugerenciasSeleccionadas = ref<any[]>([])
const presupuestoDialog = ref(false)
type ISugerenciaTemporal = {
  tempId: string
  detalle: string
  monto: number | null
}
const sugerenciasTemporales = ref<ISugerenciaTemporal[]>([])

const presupuesto = ref<IPresupuesto>({
  id: 0,
  monto: 0,
  detalle_presupuesto: '',
  orden_id: idOrden,
  prioridad: 3,
  procurador_id: 0
} as IPresupuesto)
const loadDetallOrden = async () => {
  const response = await detalleOrdenService.listarDetalleOrden(idOrden)

  if (response.data) {
    const orden: IOrdenCodigo = {
      ...response.data,
      codigoCausa: formatCausaCodigo(response.data)
    }
    //detalleOrden.value = orden
    detalleOrden.value = {
      ...orden,
      codigoCausa: orden.codigoCausa
    } as unknown as IOrden
    presupuesto.value.procurador_id = detalleOrden.value.procurador_id
    if (detalleOrden.value.presupuesto?.id) {
      presupuesto.value.detalle_presupuesto = detalleOrden.value?.presupuesto?.detalle_presupuesto
        ? detalleOrden.value?.presupuesto?.detalle_presupuesto
        : ''
      presupuesto.value.monto = detalleOrden.value?.presupuesto?.monto
        ? detalleOrden.value?.presupuesto?.monto
        : 0
      presupuesto.value.id = detalleOrden.value.presupuesto?.id
    } else {
      presupuesto.value.detalle_presupuesto = detalleOrden.value.sugerencia_presupuesto
      presupuesto.value.monto = detalleOrden.value.monto_sug_pres
    }
    idCausa.value = detalleOrden.value.causa_id
    //// carga relaciones de orden con alguna sugerencia
    const response2 = await sugerenciaOrdenService.listarActivosDeOrden(idOrden)
    sugerenciaOrden.value = response2
    console.log('sugerenciaOrden', sugerenciaOrden.value)

    sugerenciasSeleccionadas.value = sugerenciasPresupuesto.value.filter((sugerencia) =>
      sugerenciaOrden.value.some((relacion) => relacion.sugerencia_gasto_id === sugerencia.id)
    )

    console.log('sugerenciaOrden', sugerenciaOrden.value)

    console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: response.errors || 'No se pudo obtener detalle de la orden.',
      life: 3000
    })
  }
  loadTribunalesPorCausa(detalleOrden.value?.causa_id ? detalleOrden.value?.causa_id : 0)
}
const loadTribunalesPorCausa = async (id: number) => {
  const response = await tribunalService.listarTribunalPorCausa(id)
  if (response) {
    tribunales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener tribunales de causa',
      life: 3000
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
  loadSugerencias()
  loadDetallOrden()
  loadProcuradores()
})

const openNewWindow = async (url: string) => {
  window.open(url, '_blank')
}
const selectedImageUrl = ref('')
const showImageDialog = ref(false)
const showImage = (url: string) => {
  selectedImageUrl.value = `${baseUrlResource}/${url}`
  showImageDialog.value = true
}
const savePresupuesto = async () => {
  submitted.value = true
  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    if (presupuesto.value.id) {
      const payload = {
        ...presupuesto.value,
        sugerencias_seleccionadas: sugerenciasSeleccionadas.value.map((sugerencia) => ({
          id: sugerencia.id,
          detalle: sugerencia.detalle,
          monto: Number(sugerencia.monto)
        })),

        sugerencias_temporales: sugerenciasTemporales.value.map((sugerencia) => ({
          detalle: sugerencia.detalle.trim(),
          monto: Number(sugerencia.monto)
        }))
      }
      await presupuestoService.updatePresupuesto(payload)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Presupuesto update',
        life: 3000
      })
    } else {
      const payload = {
        ...presupuesto.value,

        sugerencias_seleccionadas: sugerenciasSeleccionadas.value.map((sugerencia) => ({
          id: sugerencia.id,
          detalle: sugerencia.detalle,
          monto: Number(sugerencia.monto)
        })),

        sugerencias_temporales: sugerenciasTemporales.value.map((sugerencia) => ({
          detalle: sugerencia.detalle.trim(),
          monto: Number(sugerencia.monto)
        }))
      }
      await presupuestoService.createPresupuesto(payload)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Presupuesto registrado',
        life: 3000
      })
    }
    presupuesto.value.detalle_presupuesto = ''
    presupuesto.value.procurador_id = 0
    setTimeout(() => {
      router.push({ name: 'Lista Ordenes', params: { idCausa: idCausa.value } })
    }, 3000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al guardar presupuesto',
      life: 10000
    })
  } finally {
    loading.value = false
    submitted.value = false
  }
}
const validateForm = () => {
  const mensajeToast = ref('')
  if (!presupuesto.value.procurador_id) {
    mensajeToast.value = 'Seleccione un procurador gestor.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (presupuesto.value.monto === null) {
    console.log('presupuesto.value.monto', presupuesto.value.monto)
    mensajeToast.value = 'Ingrese un monto para el presupuesto.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (!presupuesto.value.detalle_presupuesto) {
    mensajeToast.value = 'Ingrese detalle del presupuesto'
    alertToastError(mensajeToast.value)
    return false
  }
  // Si todas las validaciones pasan
  return true
}

const alertToastError = (mensaje: string) => {
  toast.add({
    severity: 'error',
    summary: 'Validación',
    detail: mensaje,
    life: 4000
  })
}

const loadSugerencias = async () => {
  try {
    sugerenciasPresupuesto.value = await sugerenciaGastoService.listarActivosYConUnaOrden(idOrden)
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error instanceof Error ? error.message : 'No se pudieron cargar las sugerencias generales.',
      life: 4000
    })
  }
}

const abrirSugerenciasPresupuesto = () => {
  //sugerenciasSeleccionadas.value = []
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
  /*sugerenciasSeleccionadas.value = sugerenciasAplicadas.value.map((item) => ({
    ...item
  }))*/
  presupuestoDialog.value = true
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
}
const agregarSugerenciaTemporal = () => {
  sugerenciasTemporales.value.push({
    tempId: crypto.randomUUID(),
    detalle: '',
    monto: null
  })
}
const eliminarSugerenciaTemporal = (tempId: string) => {
  sugerenciasTemporales.value = sugerenciasTemporales.value.filter((item) => item.tempId !== tempId)
}

const totalSugerencias = computed(() => {
  const totalSeleccionadas = sugerenciasSeleccionadas.value.reduce(
    (total, sugerencia) => total + Number(sugerencia.monto || 0),
    0
  )

  const totalTemporales = sugerenciasTemporales.value.reduce(
    (total, sugerencia) => total + Number(sugerencia.monto || 0),
    0
  )

  return totalSeleccionadas + totalTemporales
})

const cancelarPresupuesto = () => {
  sugerenciasSeleccionadas.value = sugerenciasAplicadas.value.map((item) => ({
    ...item
  }))

  presupuestoDialog.value = false
}

const validarSugerenciasTemporales = () => {
  const existeDetalleVacio = sugerenciasTemporales.value.some(
    (sugerencia) => !sugerencia.detalle.trim()
  )

  if (existeDetalleVacio) {
    toast.add({
      severity: 'warn',
      summary: 'Datos incompletos',
      detail: 'Todas las nuevas sugerencias deben tener un detalle.',
      life: 3500
    })

    return false
  }

  const existeMontoInvalido = sugerenciasTemporales.value.some(
    (sugerencia) => !sugerencia.monto || Number(sugerencia.monto) <= 0
  )

  if (existeMontoInvalido) {
    toast.add({
      severity: 'warn',
      summary: 'Monto inválido',
      detail: 'Todas las nuevas sugerencias deben tener un monto mayor a cero.',
      life: 3500
    })

    return false
  }

  return true
}

const aplicarPresupuesto = () => {
  if (!validarSugerenciasTemporales()) {
    return
  }

  if (sugerenciasSeleccionadas.value.length === 0 && sugerenciasTemporales.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Sin sugerencias',
      detail: 'Debe seleccionar o agregar al menos una sugerencia de gasto.',
      life: 3500
    })

    return
  }

  const sugerenciasExistentes = sugerenciasSeleccionadas.value.map((sugerencia) => ({
    id: Number(sugerencia.id),
    detalle: sugerencia.detalle,
    monto: Number(sugerencia.monto),
    tipo: 'existente'
  }))

  const sugerenciasNuevas = sugerenciasTemporales.value.map((sugerencia) => ({
    id: 0,
    detalle: sugerencia.detalle.trim(),
    monto: Number(sugerencia.monto),
    tipo: 'nueva'
  }))

  const todasLasSugerencias = [...sugerenciasExistentes, ...sugerenciasNuevas]

  const total = todasLasSugerencias.reduce(
    (acumulado, sugerencia) => acumulado + sugerencia.monto,
    0
  )

  sugerenciasAplicadas.value = sugerenciasSeleccionadas.value.map((item) => ({
    ...item
  }))

  console.log('sugerenciasExistentes', sugerenciasExistentes)
  console.log('sugerenciasNuevas', sugerenciasNuevas)
  console.log('todasLasSugerencias', todasLasSugerencias)
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
  console.log('total', total)
  presupuesto.value.monto = total
  const filas = todasLasSugerencias
    .map(
      (item, index) => `
        <tr>
          <td style="
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: center;
          ">
            ${index + 1}
          </td>

          <td style="
            border: 1px solid #d1d5db;
            padding: 6px;
          ">
            ${item.detalle}
          </td>

          <td style="
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: right;
          ">
            ${item.monto.toFixed(2)} Bs.
          </td>
        </tr>
      `
    )
    .join('')

  //crearOrden.value.sugerencia_presupuesto
  const tablaPresupuesto = `
    <h3>Presupuesto sugerido</h3>

    <table style="
      width: 100%;
      border-collapse: collapse;
    ">
      <thead>
        <tr>
          <th style="
            border: 1px solid #d1d5db;
            padding: 6px;
          ">
            N.º
          </th>

          <th style="
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: left;
          ">
            Detalle
          </th>

          <th style="
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: right;
          ">
            Monto
          </th>
        </tr>
      </thead>

      <tbody>
        ${filas}

        <tr>
          <td
            colspan="2"
            style="
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: right;
              font-weight: bold;
            "
          >
            TOTAL
          </td>

          <td style="
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: right;
            font-weight: bold;
          ">
            ${total.toFixed(2)} Bs.
          </td>
        </tr>
      </tbody>
    </table>
  `
  presupuesto.value.detalle_presupuesto = tablaPresupuesto
  //(crearOrden.value.sugerencia_presupuesto || '') + '' + tablaPresupuesto
  presupuestoDialog.value = false
}

const limpiarSugerenciasPresupuesto = () => {
  sugerenciasSeleccionadas.value = []
  sugerenciasTemporales.value = []
  sugerenciasAplicadas.value = []
  //totalPres.value = 0
  presupuesto.value.monto = 0
  presupuesto.value.detalle_presupuesto = ''
}
</script>

<template>
  <div class="card p-3">
    <div class="col-12">
      <Toast />
      <!-- Tabla de tribunales -->
      <br />
      <DataTable
        ref="dtTribunal"
        dataKey="id"
        :value="tribunales"
        resizableColumns
        columnResizeMode="fit"
        showGridlines
        :size="TableSize.small"
        tableStyle="min-width: 50rem"
      >
        <Column field="clase_tribunal" header="Fisiologia Tribunal">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Fisiologia Tribunal</span>
            {{ slotPropsTribunal.data?.clase_tribunal?.nombre }}
          </template></Column
        >
        <Column field="nombre" header="Nombre Tribunal">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Nombre Tribunal</span>
            {{ slotPropsTribunal.data?.juzgado?.nombre_numerico }}°
            {{ slotPropsTribunal.data?.juzgado?.jerarquia }}
            {{ slotPropsTribunal.data?.juzgado?.materia_juzgado }}
            {{ slotPropsTribunal.data?.juzgado?.distrito?.abreviatura }}
          </template></Column
        >
        <Column field="ubicacion" header="Ubicación">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Ubicación</span>
            <Button
              icon="pi pi-map-marker"
              style="width: 30px; height: 30px"
              class="p-button-rounded p-button-success mr-2"
              @click="openNewWindow(slotPropsTribunal.data?.juzgado?.coordenadas)"
            /> </template
        ></Column>
        <Column field="foto" header="Fachada">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Fachada</span>
            <Button
              style="width: 30px; height: 30px"
              icon="pi pi-image"
              class="p-button-rounded p-button-success mr-2"
              @click="showImage(slotPropsTribunal.data?.juzgado?.foto_url)"
            /> </template
        ></Column>
        <Column field="piso" header="Piso">
          <template #body="slotPropsTribunal">
            <span class="p-column-title">Piso</span>
            {{ slotPropsTribunal.data?.juzgado?.piso?.nombre }}
          </template>
        </Column>
      </DataTable>

      <h5>Detalle de la Orden</h5>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column field="codigoCausa" header="Código de Causa" style="min-width: 3rem" frozen />

        <Column field="id" header="Número de la Orden" style="min-width: 3rem"></Column>
        <Column field="prioridad" header="Bandera" style="min-width: 4rem"></Column>

        <Column field="cotizacion.condicion" header="Plazo en Horas" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.cotizacion?.condicion
                ? plazoSegunCondicion(detalleOrden?.cotizacion?.condicion)
                : ''
            }}
          </template>
        </Column>
        <Column field="descarga.ultima_foja" header="Ultima Foja" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.descarga?.ultima_foja }}
          </template>
        </Column>
        <Column
          field="procurador.name"
          header="Procurador"
          style="min-width: 6rem"
          frozen
          alignFrozen="left"
        >
          <template #body="">
            {{ detalleOrden?.procurador?.persona?.nombre }}
            {{ detalleOrden?.procurador?.persona?.apellido }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <h5>Elementos de la Orden</h5>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column
          field="entrega_informacion"
          header="INFORMACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_informacion"></span>
          </template>
        </Column>
      </DataTable>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column
          field="entrega_documentacion"
          header="DOCUMENTACIÓN"
          style="min-width: 6rem"
          alignFrozen="left"
        >
          <template #body="">
            <span v-html="detalleOrden?.entrega_documentacion"></span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-4">
          <label for="prioridad">Bandera sugerida: {{ detalleOrden?.prioridad }}</label>
          <Dropdown
            id="prioridad"
            v-model.number="presupuesto.prioridad"
            :options="PRIORIDAD"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione una bandera"
          />
        </div>
        <div class="field col-12 md:col-4">
          <label for="solicite_procurador"
            >Procurador por defecto: {{ detalleOrden?.procurador.persona?.apellido }},
            {{ detalleOrden?.procurador.persona?.nombre }}</label
          >
          <Dropdown
            id="solicite_procurador"
            v-model.number="presupuesto.procurador_id"
            :options="procuradores"
            optionLabel="nombreCompleto"
            optionValue="id"
            filter
            filterPlaceholder="Buscar Procurador"
            :invalid="submitted && !presupuesto.procurador_id"
          />
          <small class="p-error" v-if="submitted && !presupuesto.procurador_id">
            Procurador es requerido.
          </small>
        </div>
        <div class="field col-12 md:col-4">
          <label for="monto">Monto de presupuesto</label>
          <InputNumber
            id="monto"
            type="text"
            v-model.number="presupuesto.monto"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :invalid="submitted && !presupuesto.monto === null"
          />
          <small class="p-error" v-if="submitted && !presupuesto.monto === null">
            Monto es requerido.
          </small>
        </div>
        <Divider />
        <div class="field col-12">
          <h5 for="detalle_presupuesto">Detalle de presupuesto</h5>
          <div class="flex gap-2 mb-1">
        <Button
          label="Sugerir Presupuesto"
          icon="pi pi-lightbulb"
          severity="info"
          style="flex: 7"
          size="small"
          
          @click="abrirSugerenciasPresupuesto"
        />

        <Button
          label="Limpiar Presupuesto"
          icon="pi pi-trash"
          severity="secondary"
          style="flex: 3"
          size="small"
          
          @click="limpiarSugerenciasPresupuesto"
        />
      </div>
          <Editor
            id="detalle_presupuesto"
            v-model="presupuesto.detalle_presupuesto"
            :api-key="TinymceApiKey"
            :init="TinymceConfig"
            required
            :invalid="submitted && !presupuesto.detalle_presupuesto"
          />
          <small class="p-error" v-if="submitted && !presupuesto.detalle_presupuesto">
            Detalle de presupuesto es requerido.
          </small>
        </div>
      </div>
      <div class="flex justify-content-center mt-4">
        <Button
          label="PROCESAR"
          icon="pi pi-check"
          @click="savePresupuesto"
          :disabled="loading"
          v-if="!loading"
        />
        <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
      </div>
    </div>
  </div>

  <OVisorImg
    :imageUrl="selectedImageUrl"
    :visible="showImageDialog"
    @update:visible="showImageDialog = $event"
    header="Vista de Imagen"
  />

  <Dialog
    v-model:visible="presupuestoDialog"
    header="Sugerencias de Presupuesto"
    modal
    :style="{
      width: '850px',
      maxWidth: '95vw'
    }"
    :contentStyle="{
      maxHeight: '65vh',
      overflowY: 'auto'
    }"
  >
    <p class="text-600 mt-0 mb-3">Seleccione las sugerencias que desea aplicar al presupuesto.</p>

    <DataTable
      v-model:selection="sugerenciasSeleccionadas"
      :value="sugerenciasPresupuesto"
      dataKey="id"
      showGridlines
      responsiveLayout="scroll"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem" />

      <Column field="detalle" header="Detalle" />

      <Column field="monto" header="Monto" style="width: 150px">
        <template #body="slotProps">
          {{ Number(slotProps.data.monto).toFixed(2) }}
          Bs.
        </template>
      </Column>
    </DataTable>

    <!-- Nuevas sugerencias -->
    <div class="mt-4">
      <div class="flex align-items-center justify-content-between mb-2">
        <h5 class="m-0">Nuevas sugerencias</h5>

        <Button
          icon="pi pi-plus"
          rounded
          text
          severity="success"
          @click="agregarSugerenciaTemporal"
        />
      </div>

      <div
        v-if="sugerenciasTemporales.length"
        class="surface-border border-1 border-round overflow-hidden"
      >
        <div class="grid m-0 p-2 font-semibold surface-100">
          <div class="col-7">Detalle</div>

          <div class="col-4">Monto</div>

          <div class="col-1 text-center">Acción</div>
        </div>

        <div
          v-for="sugerencia in sugerenciasTemporales"
          :key="sugerencia.tempId"
          class="grid m-0 p-2 align-items-center border-top-1 surface-border"
        >
          <div class="col-7">
            <InputText
              v-model.trim="sugerencia.detalle"
              placeholder="Detalle de la sugerencia"
              class="w-full"
            />
          </div>

          <div class="col-4">
            <InputNumber
              v-model="sugerencia.monto"
              mode="decimal"
              :min="0"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              suffix=" Bs."
              placeholder="0.00"
              class="w-full"
            />
          </div>

          <div class="col-1 flex justify-content-center">
            <Button
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              @click="eliminarSugerenciaTemporal(sugerencia.tempId)"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-content-center mt-3">
        <Button
          icon="pi pi-plus"
          rounded
          outlined
          severity="success"
          @click="agregarSugerenciaTemporal"
        />
      </div>
    </div>

    <template #footer>
      <div class="w-full flex flex-column gap-3">
        <!-- TOTAL SIEMPRE VISIBLE -->
        <div class="flex justify-content-between align-items-center surface-100 border-round p-3">
          <span class="font-semibold text-700"> Total seleccionado </span>

          <span class="text-xl font-bold text-primary">
            {{ totalSugerencias.toFixed(2) }} Bs.
          </span>
        </div>

        <!-- BOTONES -->
        <div class="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            text
            @click="cancelarPresupuesto"
          />

          <Button
            label="Aplicar"
            icon="pi pi-check"
            severity="success"
            @click="aplicarPresupuesto"
          />
        </div>
      </div>
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
