<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'
import { TinymceApiKey, TinymceConfig } from '@/constants/constants'
import { PRIORIDAD } from '@/constants/orden'
import usuarioService from '@/modules/general/Usuarios/services/usuario.service'
import girarOrdenService from '../services/girarOrden.service'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import type { ICrearOrden } from '../types/crearOrden.types'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import { obtenerFechaYHoraActual } from '@/common/utils/fechaHoraActual'
import type { ITribunal } from '@/modules/general/Tribunal/types/tribunal.types'
import tribunalService from '@/modules/general/Tribunal/services/tribunal.service'
import dayjs from 'dayjs'
import causaService from '@/modules/general/Causas/services/causa.service'
import type { ITribunalDominanteResponse } from '@/modules/general/Causas/types/causa.types'
import sugerenciaGastoService from '@/modules/admin/SugerenciaGastos/services/sugerenciaGasto.service'
import type { ISugerenciaGasto } from '@/modules/admin/SugerenciaGastos/types/sugerenciaGasto.types'
import type { ISugerenciaOrden } from '@/modules/general/SugerenciaOrden/types/sugerenciaOrden.types'
import sugerenciaOrdenService from '@/modules/general/SugerenciaOrden/services/sugerenciaOrden.service'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const idCausa = Number(route.params.idCausa)
const idOrden = Number(route.query.idorden)

const tienePropina = ref(false)
const procuradores = ref<IUsuario[]>([])
const submitted = ref(false)
const loading = ref(false)
const tribunales = ref<ITribunal[]>([])
const claseTribunales = ref<any[]>([])
const tribunalDominante = ref<ITribunalDominanteResponse | null>(null)
const sugerenciasPresupuesto = ref<ISugerenciaGasto[]>([])
const sugerenciasAplicadas = ref<ISugerenciaGasto[]>([])
const sugerenciaOrden = ref<ISugerenciaOrden[]>([])

type ISugerenciaTemporal = {
  tempId: string
  detalle: string
  monto: number | null
}
const sugerenciasTemporales = ref<ISugerenciaTemporal[]>([])
const totalPres = ref<number>(0)

const crearOrden = ref<ICrearOrden>({
  id: 0,
  entrega_informacion: '',
  entrega_documentacion: '',
  fecha_inicio: dayjs().add(10, 'minute').format('YYYY-MM-DD HH:mm'),
  fecha_fin: '',
  prioridad: 3,
  lugar_ejecucion: '',
  tiene_propina: 0,
  propina: 0,
  causa_id: idCausa,
  procurador_id: 0,
  sugerencia_presupuesto: '',
  monto_sug_pres: 0
})

const resetForm = () => {
  crearOrden.value = {
    id: 0,
    entrega_informacion: '',
    entrega_documentacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    prioridad: 3,
    lugar_ejecucion: '',
    tiene_propina: 0,
    propina: 0,
    causa_id: idCausa,
    procurador_id: 0,
    sugerencia_presupuesto: '',
    monto_sug_pres: 0
  }
  tienePropina.value = false
}

watch(tienePropina, (newValue) => {
  crearOrden.value.tiene_propina = newValue ? 1 : 0
  if (!newValue) {
    crearOrden.value.propina = 0
  }
})

const loadTribunalDominante = async () => {
  const response = await causaService.obtenerTribunalDominante(idCausa)

  if (response) {
    tribunalDominante.value = response
    crearOrden.value.procurador_id = tribunalDominante.value.procurador_id ?? 0
    crearOrden.value.lugar_ejecucion = tribunalDominante.value.tribunal_dominante ?? 'Exteriores'
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener detalle del tribunal',
      life: 3000
    })
  }
}

const loadDetallOrden = async () => {
  const response = await girarOrdenService.obtenerUnaOrden(idOrden)

  if (response.status === 'success' && response.data) {
    crearOrden.value = response.data
    //console.log('crearOrden.value', crearOrden.value)
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
      detail: response.message || 'No se pudo obtener detalle de la orden.',
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

const loadTribunalesPorCausa = async (id: number) => {
  const response = await tribunalService.listarTribunalPorCausa(id)
  if (response) {
    tribunales.value = response

    const mappedTribunales = tribunales.value
      .map((tribunal: ITribunal) => {
        if (tribunal.clase_tribunal) {
          return {
            label: tribunal.clase_tribunal.nombre, // Nombre para mostrar en el Dropdown
            value: tribunal.clase_tribunal.nombre // Valor asociado al nombre
          }
        }
        return null // Devuelve null si clase_tribunal no existe
      })
      .filter((item) => item !== null)

    claseTribunales.value = [
      ...mappedTribunales,
      { label: 'Exteriores', value: 'Exteriores' } // Valor por defecto
    ]
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo  al obtener tribunales de causa',
      life: 3000
    })
  }
}
// Función de validación
const validateForm = () => {
  // Información requerida
  const mensajeToast = ref('')
  if (!crearOrden.value.entrega_informacion) {
    mensajeToast.value = 'El campo información es requerido.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Documentación requerida
  if (!crearOrden.value.entrega_documentacion) {
    mensajeToast.value = 'El campo documentación es requerido.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Lugar de ejecución requerido
  if (!crearOrden.value.lugar_ejecucion) {
    mensajeToast.value = 'Debe sugerir un tribunal.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Prioridad requerida
  if (!crearOrden.value.prioridad) {
    mensajeToast.value = 'Debe seleccionar una prioridad.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Procurador requerido
  if (!crearOrden.value.procurador_id) {
    mensajeToast.value = 'Debe seleccionar un procurador gestor.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Fecha de inicio requerida
  if (!crearOrden.value.fecha_inicio) {
    mensajeToast.value = 'Debe seleccionar una fecha de inicio.'
    alertToastError(mensajeToast.value)
    return false
  } else {
    const fechaHoraActual = obtenerFechaYHoraActual()
    //Hace la validacion si no existe el id orden (creacion de orden)
    if (!crearOrden.value.id && fechaHoraActual > crearOrden.value.fecha_inicio) {
      mensajeToast.value = 'Fecha inicio debe ser mayor a fecha actual'
      alertToastError(mensajeToast.value)
      return false
    }
  }
  // Fecha de fin requerida
  if (!crearOrden.value.fecha_fin) {
    mensajeToast.value = 'Debe seleccionar una fecha de fin.'
    alertToastError(mensajeToast.value)
    return false
  } else {
    if (crearOrden.value.fecha_fin <= crearOrden.value.fecha_inicio) {
      mensajeToast.value = 'Fecha fin debe ser mayor a fecha inicio.'
      alertToastError(mensajeToast.value)
      return false
    } else {
      const inicio = dayjs(crearOrden.value.fecha_inicio, 'YYYY-MM-DD HH:mm')
      const fin = dayjs(crearOrden.value.fecha_fin, 'YYYY-MM-DD HH:mm')
      const diffMinutos = fin.diff(inicio, 'minute')
      if (diffMinutos < 30) {
        mensajeToast.value =
          'No pude girar una orden con un tiempo de ejecución menor a los 30 minutos'
        alertToastError(mensajeToast.value)
        return false
      }
    }
  }
  // Validación de la propina (opcional, solo si tiene propina)
  if (tienePropina.value && !crearOrden.value.propina) {
    mensajeToast.value = 'Debe ingresar un monto mayor a cero para la propina.'
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
    life: 8000
  })
}
const handleSaveOrden = async () => {
  // Validar el formulario antes de guardar
  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas.value)
    console.log('sugerenciasTemporales', sugerenciasTemporales.value)
    if (crearOrden.value.id) {
      const payload = {
        ...crearOrden.value,
        fecha_inicio: normalizarFecha(crearOrden.value.fecha_inicio),
        fecha_fin: normalizarFecha(crearOrden.value.fecha_fin),
        //////
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
      const result = await girarOrdenService.updateOrden(payload)
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Orden actualizada',
          detail: 'La orden fue actualizada exitosamente.',
          life: 3000
        })
        resetForm()
        setTimeout(() => {
          router.push({ name: 'Lista Ordenes', params: { idCausa } })
        }, 3000)
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Hubo un error al crear la orden.',
          life: 10000
        })
      }
    } else {
      const payload = {
        ...crearOrden.value,

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

      const result = await girarOrdenService.createOrden(payload)
      console.log('result', result)
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Orden creada',
          detail: 'La orden fue creada exitosamente.',
          life: 3000
        })
        resetForm()
        setTimeout(() => {
          router.push({ name: 'Lista Ordenes', params: { idCausa } })
        }, 3000)
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Hubo un error al crear la orden.',
          life: 10000
        })
      }
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000
    })
  } finally {
    loading.value = false
  }
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
const sugerenciasTemporalesValidas = computed(() => {
  return sugerenciasTemporales.value.every(
    (sugerencia) => sugerencia.detalle.trim().length > 0 && Number(sugerencia.monto) > 0
  )
})

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

const loadSugerencias = async () => {
  try {
    if (idOrden) {
      sugerenciasPresupuesto.value = await sugerenciaGastoService.listarActivosYConUnaOrden(idOrden)
    } else {
      sugerenciasPresupuesto.value = await sugerenciaGastoService.listarActivosGenerales()
    }

    console.log('consul 1')
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

const normalizarFecha = (fecha: string | null | undefined) => {
  if (!fecha) return fecha
  // captura "YYYY-MM-DD HH:mm" y descarta los ":ss" si los hay
  return fecha.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(:\d{2})?$/, '$1')
}

onMounted(() => {
  loadSugerencias()
  if (idOrden) {
    loadDetallOrden()
  }

  loadProcuradores()
  loadTribunalesPorCausa(idCausa)
  loadTribunalDominante()
})

const home = { label: 'Causas', route: { name: 'Causas' } }
const breadcrumbItems = [
  { label: `Ficha ${idCausa}`, route: { name: 'Ficha', params: { id: route.params.idCausa } } },
  {
    label: 'Lista Ordenes',
    route: { name: 'Lista Ordenes', params: { idCausa: route.params.idCausa } }
  },
  { label: 'Crear Orden' }
]

const presupuestoDialog = ref(false)

/*const sugerenciasPresupuesto = ref([
  {
    id: 1,
    detalle: 'Elaboración y presentación de memorial',
    monto: 250
  },
  {
    id: 2,
    detalle: 'Seguimiento de trámite',
    monto: 180
  },
  {
    id: 3,
    detalle: 'Gestión de notificación',
    monto: 120
  },
  {
    id: 4,
    detalle: 'Audiencia y asistencia profesional',
    monto: 350
  },
  {
    id: 5,
    detalle: 'Obtención de documentación',
    monto: 150
  }
])*/

const sugerenciasSeleccionadas = ref<any[]>([])

const totalPresupuestoSeleccionado = computed(() => {
  return sugerenciasSeleccionadas.value.reduce((total, item) => total + Number(item.monto || 0), 0)
})

const abrirSugerenciasPresupuesto = () => {
  //sugerenciasSeleccionadas.value = []
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
  /*sugerenciasSeleccionadas.value = sugerenciasAplicadas.value.map((item) => ({
    ...item
  }))*/
  presupuestoDialog.value = true
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
}

const cancelarPresupuesto = () => {
  sugerenciasSeleccionadas.value = sugerenciasAplicadas.value.map((item) => ({
    ...item
  }))

  presupuestoDialog.value = false
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
  totalPres.value = total
  console.log('sugerenciasExistentes', sugerenciasExistentes)
  console.log('sugerenciasNuevas', sugerenciasNuevas)
  console.log('todasLasSugerencias', todasLasSugerencias)
  console.log('sugerenciasSeleccionadas', sugerenciasSeleccionadas)
  console.log('total', total)
  crearOrden.value.monto_sug_pres = total
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
  crearOrden.value.sugerencia_presupuesto = tablaPresupuesto
  //(crearOrden.value.sugerencia_presupuesto || '') + '' + tablaPresupuesto
  presupuestoDialog.value = false
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

const limpiarSugerenciasPresupuesto = () => {
  sugerenciasSeleccionadas.value = []
  sugerenciasTemporales.value = []
  sugerenciasAplicadas.value = []
  totalPres.value = 0
  crearOrden.value.monto_sug_pres = 0
  crearOrden.value.sugerencia_presupuesto = ''
}
</script>

<template>
  <DynamicBreadcrumb :home="home" :items="breadcrumbItems" />
  <div class="card p-3">
    <Toast />
    <div class="px-4 py-1 md:px-6 lg:px-8">
      <div class="text-700 text-center">
        <div class="text-600 font-bold text-3xl mb-1">Carga de Información y Documentación</div>
      </div>
    </div>

    <div class="col-12">
      <div class="p-fluid formgrid grid">
        <div class="field col-12">
          <h5 for="entrega_informacion">Información</h5>
          <Editor
            id="entrega_informacion"
            v-model="crearOrden.entrega_informacion"
            :api-key="TinymceApiKey"
            :init="TinymceConfig"
            required
          />
        </div>
        <div class="field col-12">
          <h5 for="entrega_documentacion">Documentación</h5>
          <Editor
            id="entrega_documentacion"
            v-model="crearOrden.entrega_documentacion"
            :api-key="TinymceApiKey"
            :init="TinymceConfig"
            required
          />
        </div>
        <div class="field col-12">
          <h5 for="sugerencia_pre_abogado">Presupuesto</h5>
          <div class="flex gap-2 mb-3">
            <Button
              label="Sugerir Presupuesto"
              icon="pi pi-lightbulb"
              severity="info"
              style="flex: 7"
              @click="abrirSugerenciasPresupuesto"
            />

            <Button
              label="Limpiar Presupuesto"
              icon="pi pi-trash"
              severity="secondary"
              style="flex: 3"
              @click="limpiarSugerenciasPresupuesto"
            />
          </div>
          <Editor
            id="carga_presupuesto"
            v-model="crearOrden.sugerencia_presupuesto"
            :api-key="TinymceApiKey"
            :init="TinymceConfig"
            required
          />
        </div>
        <Divider />
        <div class="field col-12 md:col-4">
          <label for="lugar_ejecucion">Sugiera Tribunal</label>
          <!-- <InputText id="lugar_ejecucion" type="text" v-model.trim="crearOrden.lugar_ejecucion" /> -->
          <Dropdown
            id="lugar_ejecucion"
            v-model.trim="crearOrden.lugar_ejecucion"
            :options="claseTribunales"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione tribunal"
          />
        </div>
        <div class="field col-12 md:col-4">
          <label for="prioridad">Solicite Bandera</label>
          <Dropdown
            id="prioridad"
            v-model.number="crearOrden.prioridad"
            :options="PRIORIDAD"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione una bandera"
          />
        </div>
        <div class="field col-12 md:col-4">
          <label for="solicite_procurador">Solicite Procurador Gestor</label>
          <Dropdown
            id="solicite_procurador"
            v-model="crearOrden.procurador_id"
            :options="procuradores"
            optionLabel="nombreCompleto"
            optionValue="id"
            filter
            filterPlaceholder="Buscar Procurador"
            :invalid="submitted && !crearOrden.procurador_id"
          />
          <small class="p-error" v-if="submitted && !crearOrden.procurador_id">
            Procurador es requerido.
          </small>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-3">
          <label for="fecha_inicio" class="block mb-2">Fecha/Hora Inicio</label>
          <Calendar
            id="fecha_inicio"
            :modelValue="crearOrden.fecha_inicio ? new Date(crearOrden.fecha_inicio) : null"
            @update:modelValue="
              (date) => (crearOrden.fecha_inicio = date ? formatearFechaHora(date) : '')
            "
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="field col-12 md:col-3">
          <label for="fecha_fin" class="block mb-2">Fecha/Hora Fin</label>
          <Calendar
            id="fecha_fin"
            :modelValue="crearOrden.fecha_fin ? new Date(crearOrden.fecha_fin) : null"
            @update:modelValue="
              (date) => (crearOrden.fecha_fin = date ? formatearFechaHora(date) : '')
            "
            dateFormat="yy/mm/dd"
            showTime
            hourFormat="24"
            showButtonBar
            showIcon
            iconDisplay="input"
          />
        </div>

        <!-- <div class="field col-12 md:col-3 align-items-center">
          <label for="tiene_propina" class="block mb-2">¿Tiene propina?</label>
          <div class="flex align-items-center">
            <Checkbox v-model="tienePropina" inputId="tiene_propina" binary />
            <label for="tiene_propina" class="ml-2">{{ tienePropina ? 'Si' : 'No' }}</label>
          </div>
        </div> -->

        <!-- <div class="field col-12 md:col-3">
          <label for="propina" class="block mb-2">Monto</label>
          <InputNumber
            id="propina"
            v-model="crearOrden.propina"
            :disabled="!tienePropina"
            mode="currency"
            currency="BOB"
            locale="es-BO"
            :minFractionDigits="2"
            :maxFractionDigits="2"
          />
        </div> -->
      </div>
    </div>

    <div class="flex justify-content-center mt-4">
      <Button
        label="Procesar"
        icon="pi pi-check"
        @click="handleSaveOrden"
        :disabled="loading"
        v-if="!loading"
      />
      <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
    </div>
  </div>

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
.field-checkbox {
  display: flex;
  align-items: center;
}
</style>
