<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, watch, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useLayout } from '@/layout/composables/layout'
import { AutorizacionService } from '../services/autenticacion.service'
import { tipoUsuarioOptions } from '../constants/registrarse'
import type { IRegistroForm } from '../types/login.types'
import PhoneInput from '@/common/components/Input/PhoneInput.vue'
import AppLogo from '@/common/components/shared/AppLogo.vue'
import pdfUrlAbogLider from '@/assets/pdf/ACUERDO_ABOGADO_LIDER.pdf?url';
import pdfUrlAbogIndep from '@/assets/pdf/ACUERDO_ABOGADO_INDEPENDIENTE.pdf?url';
import pdfUrlProcurador from '@/assets/pdf/ACUERDO_PROCURADORES.pdf?url';

const toast = useToast()
const { layoutConfig } = useLayout()
const steps = reactive({
  registration: true,
  terms: false,
  verification: false
})

const validationErrors = ref<Record<string, string[]>>({})

const form = ref<IRegistroForm>({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  direccion: '',
  telefono: '',
  coordenadas: '',
  observacion: '',
  tipo: '',
  foto_url: '',
  opciones_moto: {
    NO_MOTO: false,
    SI_MANEJA_NO_TIENE: false,
    SI_MOTO: false
  }
})

const loading = ref(false)
const verificationCode = ref('')
const notaTipoUsuario = ref('')
const notaTipoUsuarioNegrita = ref('')
const pdfTerminos = ref('')

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail: string
) => {
  toast.add({ severity, summary, detail, life: 3000 })
}

// props and emits
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['update:visible', 'submit'])
const internalVisible = ref(props.visible)

watch(
  () => props.visible,
  (newValue) => {
    internalVisible.value = newValue
  }
)

const onHide = () => {
  internalVisible.value = false
  emit('update:visible', false)
}

const enviarCodigoVerificacion = async () => {
  loading.value = true
  try {
    await AutorizacionService.enviarCodigoVerificacion(form.value.email)
    steps.terms = false
    steps.verification = true
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar el código de verificación. Por favor, inténtalo de nuevo.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const verifyAndRegister = async () => {
  loading.value = true

  try {
    await AutorizacionService.verificarCodigo(form.value.email, verificationCode.value)
    const response = await AutorizacionService.registrarUsuario(form.value)

    if (response?.status === 'error') {
      if (response.errors) {
        validationErrors.value = response.errors
      }
      showToast('error', 'Error', response.message || 'Error en el registro')
    } else {
      showToast('success', 'Registro exitoso', response.message || 'Te has registrado con éxito.')
      form.value = {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        direccion: '',
        telefono: '',
        coordenadas: '',
        observacion: '',
        tipo: '',
        foto_url: '',
        opciones_moto: {
          NO_MOTO: false,
          SI_MANEJA_NO_TIENE: false,
          SI_MOTO: false
        }
      }

      internalVisible.value = false
      //emit('update:visible', false)
      steps.verification = false
    }
  } catch (error) {
    showToast('error', 'Error inesperado', 'Inténtalo de nuevo más tarde.')
  } finally {
    loading.value = false
  }
}

const handleMotoOptionChange = (selectedOption: keyof typeof form.value.opciones_moto) => {
  Object.keys(form.value.opciones_moto).forEach((option) => {
    form.value.opciones_moto[option as keyof typeof form.value.opciones_moto] = false
  })
  form.value.opciones_moto[selectedOption] = true
}

const showTerms = () => {
  internalVisible.value = false
  steps.terms = true
}
const handleOptionChange = (tipo: string) => {
  console.log('Opción seleccionada:', tipo)
  // Llama a otra función o realiza lógica adicional aquí
  switch (tipo) {
    case 'ABOGADO_LIDER':
      notaTipoUsuario.value =
        'Como Abogado Líder de otros profesionales,   podrá gestionar causas y podrá registrar abogados a su cargo.'
      notaTipoUsuarioNegrita.value = 'SOLO PARA CORPORACIONES, INSTITUCINES Y EMPRESAS:'
      pdfTerminos.value = pdfUrlAbogLider
      break
    case 'ABOGADO_INDEPENDIENTE':
      notaTipoUsuario.value = 'Como Abogado Independiente, podrá gestionar causas.'
      notaTipoUsuarioNegrita.value = ''
      pdfTerminos.value = pdfUrlAbogIndep
      break
    case 'PROCURADOR':
      notaTipoUsuario.value =
        'Como Procurador, podrá capacitarse y realizar los servicios de procuraduría a las causas de los abogados. '
      notaTipoUsuarioNegrita.value = ''
      pdfTerminos.value = pdfUrlProcurador
      break
    default:
      notaTipoUsuario.value = 'Debe seleccionar un tipo de usuario.'
      notaTipoUsuarioNegrita.value = ''
      break
  }
  console.log('dddd',pdfTerminos.value)
}
</script>

<template>
  <Toast />
  <Dialog
    v-model:visible="internalVisible"
    modal
    @hide="onHide"
    header=" "
    :closeOnEscape="true"
    :style="{ width: '90%', maxWidth: '600px', padding: '0.5rem' }"
    :pt="{
      root: 'border-none rounded-lg shadow-lg',
      mask: { style: 'backdrop-filter: blur(6px)' }
    }"
  >
    <form class="p-fluid">
      <div class="text-center mb-8">
        <AppLogo class="mb-2 w-16 mx-auto" />
        <div class="text-900 text-3xl font-medium mb-2">Crear una cuenta</div>
        <span class="text-600 font-medium">Completa el formulario para registrarte</span>
      </div>

      <div class="grid">
        <div class="col-12 md:col-6 field">
          <label for="nombre" class="font-medium text-900">Nombre</label>
          <InputText id="nombre" v-model="form.nombre" placeholder="Tu nombre" />
        </div>

        <div class="col-12 md:col-6 field">
          <label for="apellido" class="font-medium text-900">Apellido</label>
          <InputText id="apellido" v-model="form.apellido" placeholder="Tu apellido" />
        </div>

        <div class="col-12 field">
          <label for="email" class="font-medium text-900">Correo electrónico</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="nombre@ejemplo.com"
          />
        </div>

        <div class="col-12 field">
          <label for="password" class="font-medium text-900">Contraseña</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="********"
            promptLabel="Ingrese una contraseña"
            weakLabel="Débil"
            mediumLabel="Mediana"
            strongLabel="Fuerte"
            :toggleMask="true"
          />
        </div>
        <div class="col-12 md:col-6 field">
          <label for="telefono" class="font-medium text-900">Teléfono</label>
          <PhoneInput id="telefono" v-model="form.telefono" />
        </div>
        <div class="col-12 md:col-6 field">
          <label for="tipoUsuario" class="font-medium text-900">Tipo de usuario</label>
          <Dropdown
            v-model="form.tipo"
            :options="tipoUsuarioOptions"
            optionLabel="label"
            option-value="value"
            placeholder="Seleccione un tipo"
            @change="handleOptionChange(form.tipo)"
          />
        </div>
        <div class="text-600" v-if="form.tipo" style="font-size: small">
          <i
            ><b>{{ notaTipoUsuarioNegrita }}</b> {{ notaTipoUsuario }}</i
          >
        </div>
        <div class="col-12 field mt-4" v-if="form.tipo === 'PROCURADOR'">
          <label for="motoOptions" class="font-medium text-900 mb-2 block"
            >Opciones de motocicleta</label
          >
          <div class="grid">
            <div class="col-4">
              <div class="field-checkbox mb-0">
                <Checkbox
                  id="si_moto"
                  v-model="form.opciones_moto.SI_MOTO"
                  @change="handleMotoOptionChange('SI_MOTO')"
                  :binary="true"
                />
                <label for="si_moto">Manejo moto <br />(Tengo)</label>
              </div>
            </div>

            <div class="col-4">
              <div class="field-checkbox mb-0">
                <Checkbox
                  id="si_maneja_no_tiene"
                  v-model="form.opciones_moto.SI_MANEJA_NO_TIENE"
                  @change="handleMotoOptionChange('SI_MANEJA_NO_TIENE')"
                  :binary="true"
                />
                <label for="si_maneja_no_tiene">Manejo moto <br />(No tengo)</label>
              </div>
            </div>

            <div class="col-4">
              <div class="field-checkbox mb-0">
                <Checkbox
                  id="no_moto"
                  v-model="form.opciones_moto.NO_MOTO"
                  @change="handleMotoOptionChange('NO_MOTO')"
                  :binary="true"
                />
                <label for="no_moto">No manejo moto</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <div class="flex justify-content-center w-full mt-4">
        <Button
          label="Continuar"
          class="p-button-primary w-full"
          @click="showTerms"
          style="padding: 0.8rem; font-size: 1.1rem; border-radius: 8px"
        />
      </div>
    </template>
  </Dialog>

  <!-- Paso 2: Modal de Términos y Condiciones -->
  <Dialog
    v-model:visible="steps.terms"
    modal
    :style="{ width: '100%', maxWidth: '800px', padding: '0.5rem' }"
    header="Términos y Condiciones"
    :closable="true"
    :pt="{
      root: 'border-none rounded-lg shadow-lg',
      mask: { style: 'backdrop-filter: blur(6px)' }
    }"
  >
    <!-- Contenedor del PDF -->
    <div class="pdf-container mb-4 overflow-auto" ref="pdfContainer" style="max-height: 60vh">
      <!--  contenido del PDF -->
      <iframe  :src="pdfTerminos" style="width: 100%; height: 100%; border: none"> </iframe>
    </div>

    <template #footer>
      <div class="flex justify-content-center w-full mt-4">
        <Button
          label="Aceptar y Continuar"
          @click="enviarCodigoVerificacion"
          class="p-button-primary w-full"
          style="padding: 0.8rem; font-size: 1.1rem; border-radius: 8px"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>

  <!-- Paso 3: Modal de Verificación de Correo -->
  <Dialog
    v-model:visible="steps.verification"
    modal
    :closable="true"
    :style="{ width: '90%', maxWidth: '500px', padding: '0.5rem' }"
    header="Verificación de Correo Electrónico"
    :pt="{
      root: 'border-none rounded-lg shadow-lg',
      mask: { style: 'backdrop-filter: blur(6px)' }
    }"
  >
    <!-- Mensaje de Instrucción -->
    <div class="text-center mb-6">
      <Message severity="success" :closable="false" class="text-base">
        <div class="text-xl font-semibold text-gray-800 mb-2">Verifica tu correo</div>
        <p class="text-gray-600 text-sm">
          Hemos enviado un código de verificación a tu correo electrónico. Por favor, ingrésalo a
          continuación:
        </p>
      </Message>
    </div>

    <!-- Campo de Código OTP -->

    <div class="flex justify-content-center">
      <InputOtp v-model="verificationCode" :length="6" />
    </div>

    <!-- Botón de Verificación -->
    <template #footer>
      <div class="flex justify-content-center w-full mt-4">
        <Button
          label="Verificar y Registrar"
          @click="verifyAndRegister"
          class="p-button-primary w-full"
          style="padding: 0.8rem; font-size: 1.1rem; border-radius: 8px"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.grid .col-12,
.grid .md\:col-6 {
  padding: 0.5rem;
}

.p-dialog .p-dialog-content {
  padding: 1rem;
}
.p-button {
  text-transform: uppercase;
  font-weight: 600;
}

/* PDF */
.pdf-container {
  height: 70vh;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
