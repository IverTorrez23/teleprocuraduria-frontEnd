<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
  procurador_id: 0
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
    procurador_id: 0
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
    console.log('response.data', response.data.data)
    crearOrden.value = response.data.data
    console.log('crearOrden.value', crearOrden.value)
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
    if (crearOrden.value.id) {
      const payload = {
        ...crearOrden.value,
        fecha_inicio: normalizarFecha(crearOrden.value.fecha_inicio),
        fecha_fin: normalizarFecha(crearOrden.value.fecha_fin)
      }
      const result = await girarOrdenService.updateOrden(payload as ICrearOrden)
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
      const result = await girarOrdenService.createOrden(crearOrden.value)
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

const normalizarFecha = (fecha: string | null | undefined) => {
  if (!fecha) return fecha
  // captura "YYYY-MM-DD HH:mm" y descarta los ":ss" si los hay
  return fecha.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(:\d{2})?$/, '$1')
}

onMounted(() => {
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
        label="Crear orden"
        icon="pi pi-check"
        @click="handleSaveOrden"
        :disabled="loading"
        v-if="!loading"
      />
      <Button label="CARGANDO..." icon="pi pi-spin pi-spinner" :disabled="true" v-else />
    </div>
  </div>
</template>

<style scoped lang="scss">
.field-checkbox {
  display: flex;
  align-items: center;
}
</style>
