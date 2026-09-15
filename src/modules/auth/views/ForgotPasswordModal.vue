<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const toast = useToast()

const paso = ref(1)
const loading = ref(false)

const email = ref('')
const codigo = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const internalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value)
  }
})

const passwordValido = computed(() => {
  return password.value.length >= 8 && password.value === passwordConfirmation.value
})

const enviarCodigo = async () => {
  if (!email.value) {
    toast.add({
      severity: 'warn',
      summary: 'Correo requerido',
      detail: 'Ingrese su correo electrónico.',
      life: 3000
    })
    return
  }

  try {
    loading.value = true

    // Aquí llamarás a tu backend
    // await AutorizacionService.enviarCodigoRecuperacion(email.value)

    toast.add({
      severity: 'success',
      summary: 'Código enviado',
      detail: 'Enviamos un código de recuperación a su correo.',
      life: 3000
    })

    paso.value = 2
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar el código de recuperación.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const verificarCodigo = async () => {
  if (!codigo.value) {
    toast.add({
      severity: 'warn',
      summary: 'Código requerido',
      detail: 'Ingrese el código recibido por correo.',
      life: 3000
    })
    return
  }

  try {
    loading.value = true

    // Aquí llamarás a tu backend
    // await AutorizacionService.verificarCodigoRecuperacion(
    //   email.value,
    //   codigo.value
    // )

    paso.value = 3
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Código inválido',
      detail: 'El código ingresado no es válido o ha expirado.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const cambiarPassword = async () => {
  if (!passwordValido.value) {
    toast.add({
      severity: 'warn',
      summary: 'Contraseña no válida',
      detail: 'La contraseña debe tener al menos 8 caracteres y ambas contraseñas deben coincidir.',
      life: 4000
    })
    return
  }

  try {
    loading.value = true

    // Aquí llamarás a tu backend
    // await AutorizacionService.restablecerPassword({
    //   email: email.value,
    //   codigo: codigo.value,
    //   password: password.value,
    //   password_confirmation: passwordConfirmation.value
    // })

    toast.add({
      severity: 'success',
      summary: 'Contraseña actualizada',
      detail: 'Su contraseña fue actualizada correctamente.',
      life: 3500
    })

    internalVisible.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar la contraseña.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const limpiarFormulario = () => {
  paso.value = 1
  email.value = ''
  codigo.value = ''
  password.value = ''
  passwordConfirmation.value = ''
  loading.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    header="Recuperar contraseña"
    :style="{ width: '90%', maxWidth: '430px' }"
    :pt="{
      root: 'border-none rounded-xl overflow-hidden',
      mask: {
        style: 'backdrop-filter: blur(6px)'
      }
    }"
    @hide="limpiarFormulario"
  >
    <!-- Paso 1 -->
    <div v-if="paso === 1" class="px-3 pb-4">
      <div class="text-center mb-4">
        <div class="recovery-icon">
          <i class="pi pi-envelope"></i>
        </div>

        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Recupera tu acceso</h2>

        <p class="text-sm text-gray-500 line-height-3">
          Ingresa el correo asociado a tu cuenta. Te enviaremos un código de verificación para
          continuar.
        </p>
      </div>

      <div class="field">
        <label for="recoveryEmail" class="font-medium text-sm text-gray-800 mb-2 block">
          Correo electrónico
        </label>

        <InputText
          id="recoveryEmail"
          v-model.trim="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          class="w-full"
          @keyup.enter="enviarCodigo"
        />
      </div>

      <Message severity="info" :closable="false" class="mt-3">
        El código será enviado únicamente si el correo corresponde a una cuenta registrada.
      </Message>

      <Button
        label="Enviar código"
        icon="pi pi-send"
        class="w-full mt-4"
        :loading="loading"
        @click="enviarCodigo"
      />
    </div>

    <!-- Paso 2 -->
    <div v-else-if="paso === 2" class="px-3 pb-4">
      <div class="text-center mb-4">
        <div class="recovery-icon">
          <i class="pi pi-shield"></i>
        </div>

        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Verifica tu identidad</h2>

        <p class="text-sm text-gray-500 line-height-3">
          Ingresa el código de verificación enviado a
          <strong>{{ email }}</strong
          >.
        </p>
      </div>

      <div class="field">
        <label for="codigo" class="font-medium text-sm text-gray-800 mb-2 block">
          Código de verificación
        </label>

        <InputText
          id="codigo"
          v-model.trim="codigo"
          maxlength="6"
          placeholder="Ejemplo: 123456"
          class="w-full verification-code"
          @keyup.enter="verificarCodigo"
        />
      </div>

      <div class="flex gap-2 mt-4">
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          class="flex-1"
          @click="paso = 1"
        />

        <Button
          label="Verificar"
          icon="pi pi-check"
          class="flex-1"
          :loading="loading"
          @click="verificarCodigo"
        />
      </div>
    </div>

    <!-- Paso 3 -->
    <div v-else class="px-3 pb-4">
      <div class="text-center mb-4">
        <div class="recovery-icon">
          <i class="pi pi-lock"></i>
        </div>

        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Crea una nueva contraseña</h2>

        <p class="text-sm text-gray-500 line-height-3">
          Define una nueva contraseña segura para recuperar el acceso a tu cuenta.
        </p>
      </div>

      <div class="field mb-3">
        <label for="newPassword" class="font-medium text-sm text-gray-800 mb-2 block">
          Nueva contraseña
        </label>

        <Password
          id="newPassword"
          v-model="password"
          :feedback="true"
          :toggleMask="true"
          class="w-full"
          inputClass="w-full"
          placeholder="Nueva contraseña"
        />
      </div>

      <div class="field">
        <label for="confirmPassword" class="font-medium text-sm text-gray-800 mb-2 block">
          Confirmar contraseña
        </label>

        <Password
          id="confirmPassword"
          v-model="passwordConfirmation"
          :feedback="false"
          :toggleMask="true"
          class="w-full"
          inputClass="w-full"
          placeholder="Repita la contraseña"
        />

        <small v-if="passwordConfirmation && password !== passwordConfirmation" class="p-error">
          Las contraseñas no coinciden.
        </small>
      </div>

      <Button
        label="Actualizar contraseña"
        icon="pi pi-lock"
        severity="success"
        class="w-full mt-4"
        :disabled="!passwordValido"
        :loading="loading"
        @click="cambiarPassword"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.recovery-icon {
  display: flex;
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: 1.7rem;
}

.verification-code {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.35rem;
}
</style>
