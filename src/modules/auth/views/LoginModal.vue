<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import ordenService from '@/modules/general/Ordenes/services/orden.service'
import { useAuthStore } from '../stores/auth.store'
import { storeToRefs } from 'pinia'
import AppLogo from '@/common/components/shared/AppLogo.vue'

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const { sessionModalOpen, sesionExpirada } = storeToRefs(authStore)

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const visible = ref(props.visible)
const loading = ref(false)
const rememberMe = ref(false)
const validationErrors = ref<Record<string, string[]>>({})
const modoForzado = ref(false)
const usuarioDistintoError = ref(false)

const form = ref({
  email: '',
  password: ''
})

// Sincronizar visibilidad modal con props y store
watch(
  () => props.visible,
  (val) => {
    visible.value = val
    sessionModalOpen.value = val
  }
)
watch(visible, (val) => emit('update:visible', val))

// Al cerrar modal
const onHide = () => {
  emit('update:visible', false)
  limpiarFormulario()
  sesionExpirada.value = false
  sessionModalOpen.value = false
  modoForzado.value = false
  usuarioDistintoError.value = false
}

// Enviar login
const onSubmit = async () => {
  loading.value = true
  validationErrors.value = {}
  usuarioDistintoError.value = false

  const response = await authStore.login(form.value)

  if (response?.status === 'success') {
    toast.add({
      severity: 'success',
      summary: '¡Bienvenido!',
      detail: 'Inicio de sesión exitoso',
      life: 3000
    })

    sessionModalOpen.value = false
    sesionExpirada.value = false
    usuarioDistintoError.value = false
    await loadCantidadEtapasOrden()
    redireccionar()
  } else {
    if (response?.errors) {
      validationErrors.value = response.errors
    }

    if (response?.message === 'Error_correo_distinto') {
      usuarioDistintoError.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: response?.message || 'Credenciales inválidas',
        life: 3000
      })
    }
  }

  loading.value = false
}

const cerrarSesion = async () => {
  modoForzado.value = true
  await authStore.logout()
  limpiarFormulario()
  sessionModalOpen.value = true
  sesionExpirada.value = false
  usuarioDistintoError.value = false
  visible.value = true
  emit('update:visible', true)
}

// Reset campos
const limpiarFormulario = () => {
  form.value = { email: '', password: '' }
  validationErrors.value = {}
  rememberMe.value = false
}

// Cargar cantidades tras login exitoso
const loadCantidadEtapasOrden = async () => {
  const response = await ordenService.obtenerCantidadEtapasOrden()
  if (response) {
    localStorage.setItem('cantidadVencidasLeves', response.cantidad_vencidas_leves.toString())
    localStorage.setItem(
      'cantidadPrePresupuestadas',
      response.cantidad_pre_presupuestadas.toString()
    )
    localStorage.setItem('cantidadVencidasGraves', response.cantidad_vencidas_graves.toString())
  } else {
    console.log('Fallo al obtener cantidades')
  }
}

// Redirección tras login
const redireccionar = () => {
  const destino = authStore.routePreviewLogin || '/causas'
  authStore.routePreviewLogin = null
  router.replace(destino)
}
</script>

<template>
  <Toast />

  <Dialog
    v-model:visible="sessionModalOpen"
    modal
    @hide="onHide"
    header=" "
    :closable="!sesionExpirada && !modoForzado"
    :dismissableMask="!sesionExpirada && !modoForzado"
    :style="{ width: '90%', maxWidth: '400px' }"
    :pt="{
      root: 'border-none rounded-xl overflow-hidden',
      mask: { style: 'backdrop-filter: blur(6px)' }
    }"
    transitionOptions="300ms ease"
  >
    <!-- Sesión expirada -->
    <div v-if="sesionExpirada" class="text-center px-4 pb-5">
      <AppLogo class="mb-2 w-16 mx-auto" />

      <h2 class="text-2xl font-semibold text-gray-800 mb-2">Sesión expirada</h2>
      <p class="text-gray-600 mb-6 text-sm">Tu sesión ha expirado por inactividad.</p>
      <Button
        label="Volver al login"
        class="w-full p-button-primary"
        @click="cerrarSesion"
        icon="pi pi-sign-in"
      />
    </div>

    <!-- Login -->
    <form v-else @submit.prevent="onSubmit" class="p-fluid px-4 pb-5">
      <div class="text-center mb-4">
        <AppLogo class="mb-2 w-16 mx-auto" />

        <div
          v-if="!sesionExpirada && !modoForzado"
          class="text-2xl font-semibold text-gray-900 mb-1"
        >
          Bienvenido
        </div>
        <div v-else class="text-xl font-semibold text-gray-900 mb-1">Sesión expirada</div>

        <p class="text-sm text-gray-500" v-if="!sesionExpirada && !modoForzado">
          Ingresa tus credenciales para continuar
        </p>
        <p class="text-sm text-gray-500" v-else>
          Por seguridad, vuelve a iniciar sesión para continuar.
        </p>

        <!-- Mensaje usuario distinto -->
        <div
          v-if="usuarioDistintoError"
          class="mt-3 p-3 rounded border border-yellow-400 bg-yellow-100 text-yellow-800 text-center text-sm font-medium"
        >
          ⚠️ Solo puedes volver a iniciar sesión con el mismo usuario tras la expiración.
        </div>
      </div>

      <div class="field mb-3">
        <label for="email" class="font-medium text-sm text-gray-800 mb-1 block">Correo</label>
        <InputText
          id="email"
          v-model="form.email"
          placeholder="nombre@ejemplo.com"
          class="w-full"
          :class="{ 'p-invalid': validationErrors['email'] }"
        />
        <small class="p-error" v-if="validationErrors['email']">{{
          validationErrors['email'][0]
        }}</small>
      </div>

      <div class="field mb-3">
        <label for="password" class="font-medium text-sm text-gray-800 mb-1 block"
          >Contraseña</label
        >
        <Password
          id="password"
          v-model="form.password"
          placeholder="********"
          :feedback="false"
          :toggleMask="true"
          class="w-full"
          :class="{ 'p-invalid': validationErrors['password'] }"
        />
        <small class="p-error" v-if="validationErrors['password']">{{
          validationErrors['password'][0]
        }}</small>
      </div>

      <div class="flex justify-between items-center mb-4 text-sm text-gray-600">
        <div class="flex items-center">
          <Checkbox v-model="rememberMe" :binary="true" inputId="rememberMe" class="mr-2" />
          <label for="rememberMe">Recordarme</label>
        </div>
        <a href="#" class="text-primary hover:underline">¿Olvidaste tu contraseña?</a>
      </div>

      <Button
        type="submit"
        label="Iniciar sesión"
        class="p-button-primary w-full"
        :loading="loading"
        icon="pi pi-sign-in"
      />
    </form>
  </Dialog>
</template>

<style scoped>
.p-dialog {
  border-radius: 1rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.p-inputtext,
.p-password,
.p-button,
.p-checkbox {
  border-radius: 0.5rem;
}

.p-button {
  text-transform: uppercase;
  font-weight: 600;
}
</style>
