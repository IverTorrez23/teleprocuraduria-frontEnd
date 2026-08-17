<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'

import paqueteService from '@/modules/admin/Paquetes/services/paquete.service'
import compraPaqueteService from '../services/compraPaquete.service'

import type { IPaquete } from '@/modules/admin/Paquetes/types/paquete.types'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAuthModals } from '@/modules/auth/composables/useAuthModals'
import cuponService from '@/modules/admin/Cupon/services/cupon.service'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Autenticación
const authStore = useAuthStore()
const { isAuthenticated, routePreviewLogin } = storeToRefs(authStore)
const { openLogin } = useAuthModals()

const { setTipoUsuarioRegistro, clearRegistrationContext } = useAuthModals()

const idPaquete = Number(route.params.idPaquete)

const paqueteSelected = ref<IPaquete>()
const codigoCupon = ref('')
const submitted = ref(false)
const loadingPaquete = ref(false)
const loadingCanje = ref(false)
const confirmarCanjeDialog = ref(false)

const tipoPaquete = computed(() => {
  if (paqueteSelected.value?.tipo === 'ABOGADO_INDEPENDIENTE') {
    return 'Paquete Personal'
  }

  return 'Paquete Corporativo'
})

const fechaVencimientoCalculada = computed(() => {
  const cantidadDias = paqueteSelected.value?.cantidad_dias

  if (!cantidadDias) {
    return ''
  }

  const fecha = new Date()
  fecha.setDate(fecha.getDate() + cantidadDias)

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(fecha)
})

const codigoCuponValido = computed(() => {
  return codigoCupon.value.trim().length >= 6
})

const codigoCuponNormalizado = computed(() => {
  return codigoCupon.value.trim().toUpperCase()
})

const loadUnPaquete = async () => {
  if (!idPaquete || Number.isNaN(idPaquete)) {
    toast.add({
      severity: 'error',
      summary: 'Paquete no válido',
      detail: 'No se encontró un identificador válido para el paquete.',
      life: 5000
    })
    console.log('idPaquete gggg', idPaquete)
    //router.push('/paquetes')
    //return
  }

  try {
    loadingPaquete.value = true

    const response = await paqueteService.obtenerUnPaquetePromocion(idPaquete)

    if (!response) {
      throw new Error('No se encontró la información del paquete.')
    }

    paqueteSelected.value = response
    console.log('response.tipo', response.tipo)
    setTipoUsuarioRegistro(response.tipo)

    if (response.es_promocion !== 1) {
      toast.add({
        severity: 'warn',
        summary: 'Paquete no promocional',
        detail: 'Este paquete no está disponible para activación mediante cupón.',
        life: 5000
      })
    }
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo cargar el paquete',
      detail:
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al consultar la información del paquete.',
      life: 5000
    })
  } finally {
    loadingPaquete.value = false
  }
}

const abrirConfirmacionCanje = () => {
  submitted.value = true

  if (!codigoCuponValido.value) {
    toast.add({
      severity: 'warn',
      summary: 'Código requerido',
      detail: 'Ingrese un código de cupón válido para continuar.',
      life: 3500
    })

    return
  }

  if (!paqueteSelected.value?.id) {
    toast.add({
      severity: 'error',
      summary: 'Paquete no disponible',
      detail: 'No se pudo identificar el paquete promocional.',
      life: 3500
    })

    return
  }
  if (!isAuthenticated.value) {
    const tipo = paqueteSelected.value?.tipo
    routePreviewLogin.value = window.location.pathname
    openLogin()
    return
  }

  confirmarCanjeDialog.value = true
}

const canjearCupon = async () => {
  if (!paqueteSelected.value?.id || !codigoCuponValido.value) {
    return
  }

  try {
    loadingCanje.value = true
    console.log('paqueteSelected.value.id', paqueteSelected.value.id)
    console.log('codigoCuponNormalizado.value', codigoCuponNormalizado.value)

    /*
     * Ajusta el nombre del método según tu servicio.
     *
     * El backend debería recibir:
     * {
     *   paquete_id: number,
     *   codigo: string
     * }
     */
    const response = await cuponService.canjearCupon(
      codigoCuponNormalizado.value,
      paqueteSelected.value.id
    )

    confirmarCanjeDialog.value = false

    toast.add({
      severity: 'success',
      summary: 'Paquete activado',
      detail:
        response.message ||
        'El cupón fue validado correctamente y el paquete promocional ya está activo en su cuenta.',
      life: 4500
    })

    setTimeout(() => {
      router.push('/mis-paquetes')
    }, 1500)
  } catch (error: unknown) {
    confirmarCanjeDialog.value = false

    toast.add({
      severity: 'error',
      summary: 'No se pudo canjear el cupón',
      detail: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      life: 10000
    })
  } finally {
    loadingCanje.value = false
  }
}

const normalizarCodigo = () => {
  codigoCupon.value = codigoCupon.value
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9]/g, '')
}

onMounted(() => {
  /*if (!isAuthenticated.value) {
    routePreviewLogin.value = window.location.pathname
    openLogin()
    return
  }*/

  loadUnPaquete()
})

/*watch(isAuthenticated, (authenticated) => {
  if (authenticated && !paqueteSelected.value) {
    loadUnPaquete()
  }
})*/
onBeforeUnmount(() => {
  clearRegistrationContext()
})
</script>

<template>
  <Toast />

  <div class="promotion-page">
    <div class="promotion-background-decoration decoration-one"></div>
    <div class="promotion-background-decoration decoration-two"></div>

    <div class="promotion-container">
      <div
        v-if="loadingPaquete"
        class="promotion-card flex align-items-center justify-content-center"
      >
        <ProgressSpinner style="width: 45px; height: 45px" strokeWidth="4" />

        <span class="ml-3 text-600"> Cargando información de la promoción... </span>
      </div>

      <div v-else-if="paqueteSelected" class="promotion-card">
        <!-- Listón de promoción -->
        <div class="promotion-ribbon">PROMOCIÓN</div>

        <!-- Encabezado -->
        <div class="promotion-header">
          <div class="promotion-icon">
            <i class="pi pi-gift"></i>
          </div>

          <div class="promotion-label">
            <i class="pi pi-sparkles mr-2"></i>
            Beneficio exclusivo
          </div>

          <h1 class="promotion-title">Active su paquete promocional</h1>

          <p class="promotion-subtitle">
            Ingrese el código de su cupón para validar el beneficio y activar el paquete en su
            cuenta.
          </p>
        </div>

        <!-- Información del paquete -->
        <div class="package-summary">
          <div class="flex flex-column gap-2">
            <span class="package-type">
              {{ tipoPaquete }}
            </span>

            <h2 class="package-name">
              {{ paqueteSelected.nombre }}
            </h2>

            <p class="package-description">
              {{ paqueteSelected.descripcion }}
            </p>
          </div>

          <div class="package-benefits">
            <div class="benefit-card">
              <div class="benefit-icon">
                <i class="pi pi-calendar"></i>
              </div>

              <div>
                <span class="benefit-label">Vigencia</span>

                <strong class="benefit-value"> {{ paqueteSelected.cantidad_dias }} días </strong>
              </div>
            </div>

            <div class="benefit-card">
              <div class="benefit-icon">
                <i class="pi pi-money-bill"></i>
              </div>

              <div>
                <span class="benefit-label">Valor del beneficio</span>

                <strong class="benefit-value"> {{ paqueteSelected.precio }} Bs. </strong>
              </div>
            </div>

            <!-- <div class="benefit-card">
              <div class="benefit-icon">
                <i class="pi pi-clock"></i>
              </div>

              <div>
                <span class="benefit-label"> Vigente aproximadamente hasta </span>

                <strong class="benefit-value benefit-date">
                  {{ fechaVencimientoCalculada }}
                </strong>
              </div>
            </div> -->
          </div>
        </div>

        <!-- Formulario para canjear -->
        <div class="coupon-section">
          <div class="coupon-section-header">
            <div>
              <h3 class="coupon-title">Código de activación</h3>

              <p class="coupon-help">
                El código se encuentra en el cupón promocional que recibió. Cada cupón puede
                utilizarse una sola vez.
              </p>
            </div>

            <i class="pi pi-ticket coupon-ticket-icon"></i>
          </div>

          <div class="field mt-4">
            <label for="codigoCupon" class="coupon-label"> Ingrese el código del cupón para validar su paquete </label>

            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-key"></i>
              </InputGroupAddon>

              <InputText
                id="codigoCupon"
                v-model="codigoCupon"
                maxlength="20"
                autocomplete="off"
                placeholder="Ejemplo: A7K9XM"
                class="coupon-input"
                :invalid="submitted && !codigoCuponValido"
                @input="normalizarCodigo"
                @keyup.enter="abrirConfirmacionCanje"
              />
            </InputGroup>

            <small v-if="submitted && !codigoCupon" class="p-error">
              Debe ingresar el código de su cupón.
            </small>

            <small v-else-if="submitted && !codigoCuponValido" class="p-error">
              El código ingresado no tiene un formato válido.
            </small>

            <small v-else class="coupon-security-message">
              <i class="pi pi-shield mr-1"></i>
              Su código será validado de forma segura antes de activar el paquete.
            </small>
          </div>

          <Message severity="info" :closable="false" class="mt-4">
            <div class="line-height-3">
              <strong>Importante:</strong>
              al confirmar el canje, el cupón quedará asociado a su cuenta y no podrá utilizarse
              nuevamente.
            </div>
          </Message>

          <Button
            label="Validar y activar paquete"
            icon="pi pi-check-circle"
            class="activation-button mt-4"
            :loading="loadingCanje"
            :disabled="!codigoCuponValido || paqueteSelected.es_promocion !== 1"
            @click="abrirConfirmacionCanje"
          />
        </div>

        <!-- Garantías -->
        <div class="trust-section">
          <div class="trust-item">
            <i class="pi pi-shield"></i>
            <span>Validación segura</span>
          </div>

          <div class="trust-item">
            <i class="pi pi-bolt"></i>
            <span>Activación inmediata</span>
          </div>

          <div class="trust-item">
            <i class="pi pi-user"></i>
            <span>Beneficio personal</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmación del canje -->
  <Dialog
    v-model:visible="confirmarCanjeDialog"
    :style="{ width: '460px', maxWidth: '95vw' }"
    header="Confirmar activación"
    :modal="true"
    :closable="!loadingCanje"
    :closeOnEscape="!loadingCanje"
  >
    <div class="confirmation-content">
      <div class="confirmation-icon">
        <i class="pi pi-gift"></i>
      </div>

      <h3 class="confirmation-title">¿Desea activar este beneficio?</h3>

      <p class="confirmation-description">
        Se validará el cupón
        <strong>{{ codigoCuponNormalizado }}</strong>
        para activar el paquete
        <strong>{{ paqueteSelected?.nombre }}</strong>
        en su cuenta.
      </p>

      <div class="confirmation-summary">
        <div class="confirmation-row">
          <span>Paquete</span>
          <strong>{{ paqueteSelected?.nombre }}</strong>
        </div>

        <div class="confirmation-row">
          <span>Vigencia</span>
          <strong> {{ paqueteSelected?.cantidad_dias }} días </strong>
        </div>

        <div class="confirmation-row">
          <span>Código</span>
          <strong class="confirmation-code">
            {{ codigoCuponNormalizado }}
          </strong>
        </div>
      </div>

      <Message severity="warn" :closable="false" class="mt-3">
        El cupón quedará marcado como utilizado después de completar la activación.
      </Message>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        severity="secondary"
        :disabled="loadingCanje"
        @click="confirmarCanjeDialog = false"
      />

      <Button
        label="Confirmar activación"
        icon="pi pi-check"
        severity="success"
        :loading="loadingCanje"
        @click="canjearCupon"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.promotion-page {
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 3rem 1rem;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.14), transparent 35%),
    radial-gradient(circle at bottom right, rgba(220, 38, 38, 0.09), transparent 35%), #f8fafc;
}

.promotion-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
}

.promotion-card {
  position: relative;
  min-height: 300px;
  padding: 2.5rem;
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 24px;
  box-shadow:
    0 25px 55px rgba(15, 23, 42, 0.1),
    0 5px 15px rgba(15, 23, 42, 0.05);
}

.promotion-ribbon {
  position: absolute;
  top: 27px;
  left: -48px;
  z-index: 4;
  width: 190px;
  padding: 0.55rem 0;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12rem;
  text-align: center;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 5px 14px rgba(185, 28, 28, 0.35);
  transform: rotate(-45deg);
}

.promotion-header {
  max-width: 680px;
  margin: 0 auto 2rem;
  text-align: center;
}

.promotion-icon {
  display: flex;
  width: 72px;
  height: 72px;
  margin: 0 auto 1rem;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 2rem;
  background: linear-gradient(135deg, #10b981, #047857);
  border-radius: 22px;
  box-shadow: 0 12px 25px rgba(16, 185, 129, 0.3);
}

.promotion-label {
  display: inline-flex;
  padding: 0.45rem 0.9rem;
  align-items: center;
  color: #047857;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #d1fae5;
  border-radius: 999px;
}

.promotion-title {
  margin: 1rem 0 0.7rem;
  color: var(--text-color);
  font-size: clamp(1.8rem, 5vw, 2.7rem);
  line-height: 1.15;
}

.promotion-subtitle {
  max-width: 590px;
  margin: 0 auto;
  color: var(--text-color-secondary);
  font-size: 1rem;
  line-height: 1.7;
}

.package-summary {
  padding: 1.5rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 18px;
}

.package-type {
  width: fit-content;
  padding: 0.35rem 0.75rem;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 700;
  background: #d1fae5;
  border-radius: 999px;
}

.package-name {
  margin: 0;
  color: var(--text-color);
  font-size: 1.55rem;
}

.package-description {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.package-benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.benefit-card {
  display: flex;
  min-height: 92px;
  padding: 1rem;
  align-items: center;
  gap: 0.8rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 14px;
}

.benefit-icon {
  display: flex;
  width: 42px;
  min-width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  color: #059669;
  font-size: 1.15rem;
  background: #d1fae5;
  border-radius: 12px;
}

.benefit-label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.benefit-value {
  display: block;
  color: var(--text-color);
  font-size: 0.95rem;
}

.benefit-date {
  font-size: 0.82rem;
}

.coupon-section {
  margin-top: 1.5rem;
  padding: 1.7rem;
  border: 2px dashed rgba(16, 185, 129, 0.35);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(255, 255, 255, 0.9));
}

.coupon-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.coupon-title {
  margin: 0 0 0.4rem;
  color: #064e3b;
  font-size: 1.3rem;
}

.coupon-help {
  max-width: 610px;
  margin: 0;
  color: #4b5563;
  line-height: 1.55;
}

.coupon-ticket-icon {
  color: #10b981;
  font-size: 2.4rem;
  transform: rotate(-12deg);
}

.coupon-label {
  display: inline-block;
  margin-bottom: 0.55rem;
  color: #1f2937;
  font-weight: 700;
}

.coupon-input {
  width: 100%;
  min-height: 52px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.16rem;
  text-transform: uppercase;
}

.coupon-security-message {
  display: block;
  margin-top: 0.55rem;
  color: #047857;
}

.activation-button {
  width: 100%;
  min-height: 52px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981, #047857);
  border: none;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.24);
}

.trust-section {
  display: flex;
  margin-top: 1.5rem;
  justify-content: center;
  gap: 2rem;
  color: var(--text-color-secondary);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
}

.trust-item i {
  color: #10b981;
}

.confirmation-content {
  text-align: center;
}

.confirmation-icon {
  display: flex;
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.7rem;
  background: linear-gradient(135deg, #10b981, #047857);
  border-radius: 50%;
}

.confirmation-title {
  margin: 0 0 0.7rem;
  color: var(--text-color);
}

.confirmation-description {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.confirmation-summary {
  margin-top: 1.25rem;
  padding: 1rem;
  text-align: left;
  background: var(--surface-ground);
  border-radius: 12px;
}

.confirmation-row {
  display: flex;
  padding: 0.6rem 0;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.confirmation-row:last-child {
  border-bottom: none;
}

.confirmation-code {
  color: #047857;
  letter-spacing: 0.1rem;
}

.promotion-background-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.decoration-one {
  top: -100px;
  right: -80px;
  width: 280px;
  height: 280px;
  background: rgba(16, 185, 129, 0.08);
}

.decoration-two {
  bottom: -120px;
  left: -100px;
  width: 320px;
  height: 320px;
  background: rgba(239, 68, 68, 0.06);
}

@media screen and (max-width: 768px) {
  .promotion-page {
    padding: 1.5rem 0.75rem;
  }

  .promotion-card {
    padding: 2rem 1.1rem 1.4rem;
    border-radius: 18px;
  }

  .package-benefits {
    grid-template-columns: 1fr;
  }

  .coupon-section {
    padding: 1.2rem;
  }

  .coupon-ticket-icon {
    display: none;
  }

  .trust-section {
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
  }

  .promotion-ribbon {
    top: 21px;
    left: -55px;
  }
}
</style>
