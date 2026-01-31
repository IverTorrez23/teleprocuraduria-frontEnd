<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import Timeline from 'primevue/timeline'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import Skeleton from 'primevue/skeleton'

import type { ICausaPosta } from '../types/causaPosta.types'
import causaPostaService from '../service/causaPosta.service'
import type { IInformePosta } from '../../InformePosta/types/informePosta.types'
import informePostaService from '../../InformePosta/service/informePosta.service'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import { devuelveSoloFecha } from '@/common/utils/devuelveSoloFecha'
import type { ITipoPosta } from '@/modules/admin/TipoPostas/types/tipoPosta.types'
import tipoPostaService from '@/modules/admin/TipoPostas/service/tipoPosta.service'
import ordenService from '../../Ordenes/services/orden.service'

const submitted = ref(false)
const informePostaDialog = ref(false)
const deleteInformeDialog = ref(false)
const deleteTruncamientoDialog = ref(false)
const informeDetalleDialog = ref(false)
const informeTruncamientoDetalleDialog = ref(false)
const esRegistroTruncamiento = ref(false)
const gastoProcesalHastaFecha = ref(0)
const totalGasto = ref(0)
const nombrePlantilla = ref('')
const eliminarAvanceFisicoDialog = ref(false)
const detalleInforme = ref<IInformePosta>()
const informePosta = ref<IInformePosta>({
  id: 0,
  foja_informe: '',
  fecha_informe: '',
  calculo_gasto: 0,
  honorario_informe: '',
  foja_truncamiento: '',
  fecha_truncamiento: '',
  honorario_informe_truncamiento: '',
  esta_escrito: 0,
  tipoposta_id: 0,
  causaposta_id: 0
} as IInformePosta)

const toast = useToast()
const route = useRoute()

const causaId = Number(route.params.idCausa)
const causaPostas = ref<ICausaPosta[]>([])
const cargando = ref(true)
const concluyendo = ref<number | null>(null)

const tipoPostas = ref<ITipoPosta[]>([])

const loadTipoPosta = async () => {
  const response = await tipoPostaService.listarTipoPostas()
  if (response) {
    tipoPostas.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch tipo posta',
      life: 3000
    })
  }
}
const loadCausasPostas = async () => {
  console.log('causaId', causaId)
  cargando.value = true
  try {
    const response = await causaPostaService.listarCausaPosta(causaId)
    if (response) {
      causaPostas.value = response
      nombrePlantilla.value = causaPostas.value[0].copia_nombre_plantilla
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Causa posta',
      life: 3000
    })
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  loadCausasPostas()
  loadTipoPosta()
})

const hideDialog = () => {
  informePostaDialog.value = false
  informeDetalleDialog.value = false
  informeTruncamientoDetalleDialog.value = false
  submitted.value = false
}

const registrarInformeModal = (idCausaPosta: number) => {
  informePosta.value.id = 0
  informePosta.value.foja_informe = ''
  informePosta.value.foja_truncamiento = ''
  informePosta.value.fecha_informe = ''
  informePosta.value.fecha_truncamiento = ''
  informePosta.value.honorario_informe = ''
  informePosta.value.honorario_informe_truncamiento = ''
  informePosta.value.tipoposta_id = 0

  informePostaDialog.value = true
  esRegistroTruncamiento.value = false
  informePosta.value.causaposta_id = idCausaPosta
}

const actualizarInformeModal = (infPOsta: IInformePosta) => {
  esRegistroTruncamiento.value = false
  informePostaDialog.value = true
  informePosta.value = { ...infPOsta }
}

const saveInformePosta = async () => {
  submitted.value = true
  if (
    !informePosta.value?.foja_informe ||
    !informePosta.value?.fecha_informe ||
    !informePosta.value?.honorario_informe ||
    (esRegistroTruncamiento.value &&
      (!informePosta.value?.foja_truncamiento ||
        !informePosta.value?.fecha_truncamiento ||
        !informePosta.value?.honorario_informe_truncamiento ||
        !informePosta.value?.tipoposta_id))
  )
    return

  try {
    if (informePosta.value.fecha_informe) {
      const fechaInforme = new Date(informePosta.value.fecha_informe)
      if (!isNaN(fechaInforme.getTime())) {
        informePosta.value.fecha_informe = fechaInforme.toISOString().split('T')[0]
      }
    }

    if (informePosta.value.id) {
      if (informePosta.value.fecha_truncamiento) {
        const fechaTruncamiento = new Date(informePosta.value.fecha_truncamiento)
        if (!isNaN(fechaTruncamiento.getTime())) {
          informePosta.value.fecha_truncamiento = fechaTruncamiento.toISOString().split('T')[0]
        }
      }
      await informePostaService.updateInformePosta(informePosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Informe  Updated',
        life: 3000
      })
    } else {
      await informePostaService.createInformePosta(informePosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Informe Created',
        life: 3000
      })
    }
    hideDialog()
    loadCausasPostas()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save informe',
      life: 3000
    })
  }
}

const mostrarInformeModal = async (detInforme: IInformePosta) => {
  const result = await ordenService.obtenerSumatoriaGastosHastaFecha(
    causaId,
    detInforme.fecha_informe
  )

  gastoProcesalHastaFecha.value = result
  const honorario = Number(detInforme.honorario_informe ?? 0)
  totalGasto.value = gastoProcesalHastaFecha.value + honorario
  informeDetalleDialog.value = true
  detalleInforme.value = detInforme
}
const mostrarInformeModalTruncamiento = async (detInforme: IInformePosta) => {
  const result = await ordenService.obtenerSumatoriaGastosHastaFecha(
    causaId,
    detInforme.fecha_truncamiento
  )

  gastoProcesalHastaFecha.value = result
  const honorario = Number(detInforme.honorario_informe_truncamiento ?? 0)
  totalGasto.value = gastoProcesalHastaFecha.value + honorario
  informeTruncamientoDetalleDialog.value = true
  detalleInforme.value = detInforme
}
const deleteInformeConfir = (infor: IInformePosta) => {
  informePosta.value = infor
  deleteInformeDialog.value = true
}
const deleteTruncamientoConfir = (infor: IInformePosta) => {
  informePosta.value = infor
  deleteTruncamientoDialog.value = true
}

const deleteInforme = async () => {
  try {
    if (informePosta.value && informePosta.value.id) {
      await informePostaService.deleteInformePosta(informePosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Informe Deleted',
        life: 3000
      })
      deleteInformeDialog.value = false
      informePostaDialog.value = false
      loadCausasPostas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete materia',
      life: 3000
    })
  }
}

const deleteTruncamiento = async () => {
  try {
    if (informePosta.value && informePosta.value.id) {
      await informePostaService.deleteTruncamiento(informePosta.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Truncamiento Deleted',
        life: 3000
      })
      deleteTruncamientoDialog.value = false
      informePostaDialog.value = false
      loadCausasPostas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete materia',
      life: 3000
    })
  }
}

const registroTruncamiento = () => {
  esRegistroTruncamiento.value = true
}
const verTruncamiento = (trunca: IInformePosta) => {
  informePostaDialog.value = true
  esRegistroTruncamiento.value = true
  informePosta.value = { ...trunca }
}
const isConcluidoLocked = (idx: number) => {
  const actual = causaPostas.value[idx]
  const next = causaPostas.value[idx + 1]
  return (
    !!(next && (next.tiene_informe === 1 || next.informe_posta)) ||
    !!(
      actual.informe_posta &&
      actual.informe_posta.tipoposta_id &&
      actual.informe_posta.tipoposta_id > 0
    )
  )
}

const isLockedButton = (idx: number) => {
  const after = causaPostas.value[idx - 1]
  return (
    !!(after && after.tiene_informe === 0) ||
    !!(
      after &&
      after.informe_posta &&
      after.informe_posta.tipoposta_id &&
      after.tiene_informe === 1 &&
      after.informe_posta?.tipoposta_id > 0
    )
  )
}

const openModalDeletAvance = () => {
  eliminarAvanceFisicoDialog.value = true
}
const deleteAvanceFisico = async () => {
  try {
    if (causaId) {
      await causaPostaService.deleteTodoAvanceFisicoPorCausa(causaId)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Avance Deleted',
        life: 3000
      })
      eliminarAvanceFisicoDialog.value = false
      loadCausasPostas()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete Avance',
      life: 3000
    })
  }
}
</script>

<template>
  <Toast />

  <Card>
    <template #title
      >Avance físico {{ nombrePlantilla }}
      <Button
        v-if="nombrePlantilla != ''"
        label="Eliminar"
        icon="pi pi-trash"
        class="p-button-danger mr-2"
        @click="openModalDeletAvance"
        rounded
    /></template>
    <template #content>
      <div v-if="cargando" class="flex flex-column gap-3">
        <Skeleton height="4rem" />
        <Skeleton height="4rem" />
        <Skeleton height="4rem" />
      </div>

      <Timeline v-else :value="causaPostas" layout="vertical" class="avance-vertical">
        <!-- Marker con color por estado -->
        <template #marker="slotProps">
          <span
            class="custom-marker"
            :class="slotProps.item.tiene_informe === 1 ? 'ok' : 'pending'"
          >
            <i
              class="pi"
              :class="slotProps.item.tiene_informe === 1 ? 'pi-check' : 'pi-ellipsis-h'"
            ></i>
          </span>
        </template>

        <!-- Contenido del ítem -->
        <template #content="slotProps">
          <div class="step-card">
            <div class="step-header">
              <span class="step-title">{{ slotProps.item.nombre }}</span>
              <Tag
                v-if="slotProps.item.tiene_informe === 0"
                :value="'Pendiente'"
                :severity="'secondary'"
              />
              <Tag
                v-if="
                  slotProps.item.tiene_informe === 1 &&
                  slotProps.item.informe_posta?.tipoposta_id === 0
                "
                :value="'Concluido'"
                :severity="'success'"
              />
              <Tag
                v-if="
                  slotProps.item.tiene_informe === 1 &&
                  slotProps.item.informe_posta?.tipoposta_id > 0
                "
                :value="'Truncado'"
                :severity="'danger'"
                icon="pi pi-exclamation-triangle"
                class="cursor-pointer"
                @click="verTruncamiento(slotProps.item.informe_posta)"
              />
              <Button
                v-if="
                  slotProps.item.tiene_informe === 1 &&
                  slotProps.item.informe_posta?.tipoposta_id > 0
                "
                style="width: 30px; height: 30px"
                icon="pi pi-info-circle"
                class="p-button-rounded p-button-info mr-2"
                outlined
                @click="mostrarInformeModalTruncamiento(slotProps.item.informe_posta)"
              />
            </div>

            <div class="step-actions">
              <Button
                v-if="slotProps.item.tiene_informe === 0"
                label="Concluir paso"
                icon="pi pi-check"
                :loading="concluyendo === slotProps.item.id"
                :disabled="isLockedButton(slotProps.index)"
                @click="registrarInformeModal(slotProps.item.id)"
              />

              <Button
                v-else
                label="Concluido"
                icon="pi pi-check"
                severity="success"
                :disabled="isConcluidoLocked(slotProps.index)"
                @click="actualizarInformeModal(slotProps.item.informe_posta)"
                outlined
              />
              &nbsp;
              <Button
                v-if="slotProps.item.tiene_informe === 1"
                style="width: 30px; height: 30px"
                icon="pi pi-info-circle"
                class="p-button-rounded p-button-info mr-2"
                outlined
                @click="mostrarInformeModal(slotProps.item.informe_posta)"
              />
            </div>
          </div>
        </template>
      </Timeline>
    </template>
  </Card>

  <!-- create and edit modal -->
  <Dialog
    v-model:visible="informePostaDialog"
    :style="{ width: '470px' }"
    header="Informe Posta"
    :modal="true"
    class="p-fluid"
  >
    <div class="registro-informe" v-if="!esRegistroTruncamiento">
      <div class="field">
        <label for="foja_informe">Nombre Foja</label>
        <InputText
          id="foja_informe"
          v-model.trim="informePosta.foja_informe"
          required="true"
          autofocus
          :invalid="submitted && !informePosta.foja_informe"
        />
        <small class="p-error" v-if="submitted && !informePosta.foja_informe"
          >foja informe es requerido.</small
        >
      </div>

      <div class="field">
        <label for="fecha_informe">Fecha informe</label>
        <Calendar
          id="fecha_informe"
          :modelValue="
            informePosta.fecha_informe
              ? new Date(informePosta.fecha_informe.replace(/-/g, '/'))
              : null
          "
          @update:modelValue="
            (date) => (informePosta.fecha_informe = date ? formatearFechaHora(date) : '')
          "
          dateFormat="yy/mm/dd"
          showButtonBar
          showIcon
          iconDisplay="input"
        />
        <small class="p-error" v-if="submitted && !informePosta?.fecha_informe"
          >Fecha informe requerido.</small
        >
      </div>

      <div class="field">
        <label for="honorario_informe">Honorario</label>
        <InputText
          id="honorario_informe"
          v-model.trim="informePosta.honorario_informe"
          required="true"
          autofocus
          :invalid="submitted && !informePosta?.honorario_informe"
        />
        <small class="p-error" v-if="submitted && !informePosta?.honorario_informe"
          >Honorario es requerido.</small
        >
      </div>
    </div>

    <div v-if="esRegistroTruncamiento" class="registro-truncamiento">
      <div class="field">
        <label for="foja_truncamiento">Foja Truncamiento</label>
        <InputText
          id="foja_truncamiento"
          v-model.trim="informePosta.foja_truncamiento"
          required="true"
          autofocus
          :invalid="submitted && !informePosta.foja_truncamiento"
        />
        <small class="p-error" v-if="submitted && !informePosta.foja_truncamiento"
          >foja informe es requerido.</small
        >
      </div>

      <div class="field">
        <label for="fecha_truncamiento">Fecha truncamiento</label>
        <Calendar
          id="fecha_truncamiento"
          :modelValue="
            informePosta.fecha_truncamiento
              ? new Date(informePosta.fecha_truncamiento.replace(/-/g, '/'))
              : null
          "
          @update:modelValue="
            (date) => (informePosta.fecha_truncamiento = date ? formatearFechaHora(date) : '')
          "
          dateFormat="yy/mm/dd"
          showButtonBar
          showIcon
          iconDisplay="input"
        />
        <small class="p-error" v-if="submitted && !informePosta?.fecha_truncamiento"
          >Fecha informe requerido.</small
        >
      </div>

      <div class="field">
        <label for="honorario_informe_truncamiento">Honorario truncamiento</label>
        <InputText
          id="honorario_informe_truncamiento"
          v-model.trim="informePosta.honorario_informe_truncamiento"
          required="true"
          autofocus
          :invalid="submitted && !informePosta?.honorario_informe_truncamiento"
        />
        <small class="p-error" v-if="submitted && !informePosta?.honorario_informe_truncamiento"
          >Honorario es requerido.</small
        >
      </div>

      <div class="field">
        <label for="tipoposta_id">Tipo truncamiento</label>
        <Dropdown
          id="tipoposta_id"
          v-model="informePosta.tipoposta_id"
          :options="tipoPostas"
          optionLabel="nombre"
          optionValue="id"
          filter
          autofocus
          filterPlaceholder="Buscar tipo"
          :invalid="submitted && !informePosta.tipoposta_id"
        />

        <small class="p-error" v-if="submitted && !informePosta.tipoposta_id"
          >Tipo es requerido.</small
        >
      </div>
    </div>
    <template #footer>
      <Button
        v-if="informePosta.id && !esRegistroTruncamiento"
        label="Eliminar"
        severity="danger"
        icon="pi pi-trash"
        class="p-button-text"
        @click="deleteInformeConfir(informePosta)"
      />
      <Button
        v-if="informePosta.id && informePosta?.tipoposta_id && informePosta?.tipoposta_id > 0"
        label="Eliminar Truncamiento"
        severity="danger"
        icon="pi pi-trash"
        class="p-button-text"
        @click="deleteTruncamientoConfir(informePosta)"
      />
      <Button
        v-if="informePosta.id && !informePosta.tipoposta_id"
        severity="warning"
        label="Truncamiento"
        icon="pi pi-ban"
        class="p-button-text"
        @click="registroTruncamiento"
      />
      <Button
        label="Cancel"
        severity="secondary"
        icon="pi pi-times"
        class="p-button-text"
        @click="hideDialog"
      />
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveInformePosta" />
    </template>
  </Dialog>
  <!-- detalle de informe -->
  <Dialog
    v-model:visible="informeDetalleDialog"
    :style="{ width: '520px' }"
    header="Detalle Informe"
    modal
  >
    <Card>
      <template #content>
        <ul class="list-none p-0 m-0">
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Foja:</span>
            <span>{{ detalleInforme?.foja_informe }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Fecha informe:</span>
            <span>{{ devuelveSoloFecha(detalleInforme?.fecha_informe) }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Gastos Procesales:</span>
            <span>{{ gastoProcesalHastaFecha }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Honorario:</span>
            <span>{{ detalleInforme?.honorario_informe }}</span>
          </li>
          <li class="flex justify-content-between py-2">
            <span class="font-semibold text-600">Total:</span>
            <span>{{ totalGasto }}</span>
          </li>
        </ul>
      </template>
    </Card>

    <template #footer>
      <Button label="Cerrar" icon="pi pi-check" severity="primary" @click="hideDialog" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="informeTruncamientoDetalleDialog"
    :style="{ width: '520px' }"
    header="Detalle Informe Truncamiento"
    modal
  >
    <Card>
      <template #content>
        <ul class="list-none p-0 m-0">
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Foja:</span>
            <span>{{ detalleInforme?.foja_truncamiento }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Fecha informe:</span>
            <span>{{ devuelveSoloFecha(detalleInforme?.fecha_truncamiento) }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Gastos Procesales:</span>
            <span>{{ gastoProcesalHastaFecha }}</span>
          </li>
          <li class="flex justify-content-between border-bottom-1 surface-border py-2">
            <span class="font-semibold text-600">Honorario:</span>
            <span>{{ detalleInforme?.honorario_informe_truncamiento }}</span>
          </li>
          <li class="flex justify-content-between py-2">
            <span class="font-semibold text-600">Total:</span>
            <span>{{ totalGasto }}</span>
          </li>
        </ul>
      </template>
    </Card>

    <template #footer>
      <Button label="Cerrar" icon="pi pi-check" severity="primary" @click="hideDialog" />
    </template>
  </Dialog>

  <!-- dialog delete -->
  <Dialog
    v-model:visible="deleteInformeDialog"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="informePosta"
        >¿Estás seguro que quieres eliminar <b>{{ informePosta.foja_informe }}</b
        >?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deleteInformeDialog = false"
      />
      <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteInforme" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="deleteTruncamientoDialog"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="informePosta">¿Estás seguro que quieres eliminar el truncamiento?</span>
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deleteTruncamientoDialog = false"
      />
      <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteTruncamiento" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="eliminarAvanceFisicoDialog"
    :style="{ width: '450px' }"
    header="Eliminar"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="causaId">¿Estás seguro de que deseas eliminar este avance fisico?</span>
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="eliminarAvanceFisicoDialog = false"
      />
      <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteAvanceFisico" />
    </template>
  </Dialog>
</template>

<style scoped>
/* Marker circular custom */
.custom-marker {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 0 2px var(--surface-border);
  font-size: 0.9rem;
}
.custom-marker.ok {
  background: var(--green-500);
}
.custom-marker.pending {
  background: var(--surface-500);
}

/* Card visual por paso */
.step-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 0.75rem;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.step-title {
  font-weight: 600;
}

/* ===== Flecha en el conector del Timeline (vertical) =====
   PrimeVue genera .p-timeline-event-connector entre items.
   Le agregamos una punta de flecha (triángulo) que apunta hacia abajo.
*/
.avance-vertical :deep(.p-timeline-event-connector) {
  position: relative;

  background: var(--surface-border); /* color del “línea” */
  width: 2px; /* grosor de la línea */
}

/* Punta de flecha (triángulo) */
.avance-vertical :deep(.p-timeline-event-connector)::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -8px; /* separa la punta del final del conector */
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--surface-border); /* mismo color que la línea */
}

/* Evitar flecha en el último ítem (no hay siguiente) */
.avance-vertical :deep(.p-timeline-event:last-child .p-timeline-event-connector)::after {
  display: none;
}
.p-dialog .p-dialog-footer {
  padding: 0.75rem 1.5rem; /* ajusta vertical/horizontal */
}
</style>
