<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import perfilUsuarioService from '../services/perfilUsuario.service'
import type { IPerfilUsuario } from '../types/PerfilUsuario.types'
import { baseUrlResource } from '@/config/constants'
import type { ServiceResponse } from '@/common/utils/types/services.types'
import LeafletMapModal from '@/common/components/LeafletMap/LeafletMapModal.vue'
import type { Location } from '@/common/utils/types/leafletMap.types'

const toast = useToast()
const mapVisible = ref(false)
const selectedLocation = ref<Location | null>(null)

const perfilUsuario = ref<IPerfilUsuario>({
  name: '',
  email: '',
  tipo: '',
  persona: {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    coordenadas: '',
    observacion: '',
    foto_url: ''
  }
})

const showMap = () => {
  mapVisible.value = true
}

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const estados = reactive({
  loading: false,
  saving: false,
  changingPassword: false
})

const validationErrors = ref<Record<string, string[]>>({})

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail: string
) => {
  toast.add({ severity, summary, detail, life: 3000 })
}

const handleLocationSelected = (location: Location) => {
  perfilUsuario.value.persona.coordenadas = `${location.coordinates[0]}, ${location.coordinates[1]}`
  perfilUsuario.value.persona.direccion = location.details.address
  selectedLocation.value = location
}

const cargarPerfilUsuario = async () => {
  estados.loading = true
  try {
    const response = (await perfilUsuarioService.obtenerPerfil()) as ServiceResponse<any>
    if (response.status === 'success' && response.data?.data) {
      perfilUsuario.value = { ...response.data.data.user }
    } else {
      showToast('error', 'Error', response.message || 'Error desconocido al obtener perfil')
    }
  } catch {
    showToast('error', 'Error', 'No se pudo cargar la información del usuario')
  } finally {
    estados.loading = false
  }
}
const actualizarPerfil = async () => {
  estados.saving = true
  validationErrors.value = {}
  try {
    const response = await perfilUsuarioService.actualizarPerfil(perfilUsuario.value)
    if (response?.status === 'error') {
      if (response.errors) {
        validationErrors.value = response.errors
      }
      showToast('error', 'Error', response.message || 'Error al actualizar el perfil')
    } else {
      showToast('success', 'Éxito', response.data.message || 'Perfil actualizado')
    }
  } catch {
    showToast('error', 'Error', 'No se pudo actualizar el perfil')
  } finally {
    estados.saving = false
  }
}

const onFileSelect = async (event: any) => {
  const file = event.files[0]
  if (!file) return showToast('error', 'Error', 'No se seleccionó ningún archivo.')
  if (file.size > 1000000) return showToast('error', 'Error', 'El archivo es demasiado grande.')

  estados.saving = true
  try {
    const response: any = await perfilUsuarioService.cambiarFoto(file)
    if (response.status === 'success') {
      perfilUsuario.value.persona.foto_url = response.data.data.foto_url
      showToast('success', 'Éxito', response.data.message || 'Foto actualizada correctamente')
    } else {
      showToast('error', 'Error', response.message || 'Error al actualizar la foto')
    }
  } catch {
    showToast('error', 'Error', 'No se pudo actualizar la foto')
  } finally {
    estados.saving = false
  }
}

const changePassword = async () => {
  estados.changingPassword = true
  validationErrors.value = {}
  try {
    const passwordData = {
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      new_password_confirmation: passwordForm.confirmPassword
    }
    const response: any = await perfilUsuarioService.cambiarPassword(passwordData)
    if (response.status === 'success') {
      showToast('success', 'Éxito', response.data?.message || 'Contraseña actualizada')
      Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      if (response.errors) {
        validationErrors.value = response.errors
      }
      showToast('error', 'Error', response.message || 'Error al cambiar la contraseña')
    }
  } catch {
    showToast('error', 'Error', 'No se pudo cambiar la contraseña')
  } finally {
    estados.changingPassword = false
  }
}

const fotoPerfilUrl = computed(() =>
  perfilUsuario.value.persona.foto_url
    ? `${baseUrlResource}/${perfilUsuario.value.persona.foto_url}`
    : ''
)

onMounted(cargarPerfilUsuario)
</script>

<template>
  <div class="card">
    <h1 class="text-3xl font-bold mb-4 text-center text-900">Perfil de Usuario</h1>
    <div class="grid">
      <div class="col-12 md:col-4 flex flex-column align-items-center">
        <div class="relative mb-3">
          <Avatar
            :image="fotoPerfilUrl"
            size="xlarge"
            shape="circle"
            class="shadow-5 mb-3"
            :style="{ width: '250px', height: '250px' }"
          />
          <FileUpload
            mode="basic"
            :auto="true"
            accept="image/*"
            :maxFileSize="1000000"
            @select="onFileSelect"
            :customUpload="true"
            :showCancelButton="false"
            chooseLabel="Cambiar foto"
            class="p-button-outlined p-button-rounded p-button-secondary w-full"
          />
        </div>
        <h2 class="text-2xl font-semibold mb-2 text-900">
          {{ perfilUsuario.persona.nombre }} {{ perfilUsuario.persona.apellido }}
        </h2>
        <p class="text-600 mb-2">{{ perfilUsuario.email }}</p>
        <Tag :value="perfilUsuario.tipo" severity="info" class="mb-4" />
      </div>
      <div class="col-12 md:col-8">
        <TabView>
          <TabPanel header="Información Personal">
            <form @submit.prevent="actualizarPerfil" class="p-fluid">
              <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                  <label for="nombre" class="font-medium text-900">Nombre</label>
                  <InputText
                    :class="{ 'p-invalid': validationErrors['persona.nombre'] }"
                    id="nombre"
                    v-model="perfilUsuario.persona.nombre"
                  />
                  <small class="p-error" v-if="validationErrors['persona.nombre']">{{
                    validationErrors['persona.nombre'][0]
                  }}</small>
                </div>
                <div class="field col-12 md:col-6">
                  <label for="apellido" class="font-medium text-900">Apellido</label>
                  <InputText
                    :class="{ 'p-invalid': validationErrors['persona.apellido'] }"
                    id="apellido"
                    v-model="perfilUsuario.persona.apellido"
                  />
                  <small class="p-error" v-if="validationErrors['persona.apellido']">{{
                    validationErrors['persona.apellido'][0]
                  }}</small>
                </div>
                <div class="field col-12">
                  <label for="telefono" class="font-medium text-900">Teléfono</label>
                  <InputText
                    :class="{ 'p-invalid': validationErrors['persona.telefono'] }"
                    id="telefono"
                    v-model="perfilUsuario.persona.telefono"
                  />
                  <small class="p-error" v-if="validationErrors['persona.telefono']">{{
                    validationErrors['persona.telefono'][0]
                  }}</small>
                </div>

                <div class="field col-12">
                  <label for="observacion" class="font-medium text-900">Observación</label>
                  <Textarea
                    id="observacion"
                    v-model="perfilUsuario.persona.observacion"
                    rows="4"
                    autoResize
                    :class="{ 'p-invalid': validationErrors['persona.observacion'] }"
                  />
                  <small class="p-error" v-if="validationErrors['persona.observacion']">{{
                    validationErrors['persona.observacion'][0]
                  }}</small>
                </div>

                <div class="field col-12">
                  <label for="coordenadas" class="font-medium text-900">Ubicación GPS</label>

                  <div class="p-inputgroup">
                    <InputText
                      id="coordenadas"
                      v-model="perfilUsuario.persona.coordenadas"
                      readonly
                      :class="{ 'p-invalid': validationErrors['persona.coordenadas'] }"
                    />
                    <Button
                      type="button"
                      icon="pi pi-map-marker"
                      @click="showMap"
                      class="p-button-primary"
                    />
                  </div>
                  <small class="p-error" v-if="validationErrors['persona.coordenadas']">
                    {{ validationErrors['persona.coordenadas'][0] }}
                  </small>
                </div>
                <div class="field col-12">
                  <label for="direccion" class="font-medium text-900">Dirección</label>
                  <InputText
                    :class="{ 'p-invalid': validationErrors['persona.direccion'] }"
                    id="direccion"
                    v-model="perfilUsuario.persona.direccion"
                  />
                  <small class="p-error" v-if="validationErrors['persona.direccion']">{{
                    validationErrors['persona.direccion'][0]
                  }}</small>
                </div>
              </div>
              <div class="flex justify-content-end mt-4">
                <Button
                  type="submit"
                  label="Guardar cambios"
                  icon="pi pi-check"
                  :loading="estados.saving"
                />
              </div>
            </form>
          </TabPanel>
          <TabPanel header="Cambiar Contraseña">
            <form @submit.prevent="changePassword" class="p-fluid">
              <div class="field">
                <label for="currentPassword" class="font-medium text-900">Contraseña actual</label>
                <Password
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  :feedback="false"
                  toggleMask
                  class="p-inputtext-sm"
                  :class="{ 'p-invalid': validationErrors['current_password'] }"
                />
                <small class="p-error" v-if="validationErrors['current_password']">{{
                  validationErrors['current_password'][0]
                }}</small>
              </div>
              <div class="field">
                <label for="newPassword" class="font-medium text-900">Nueva contraseña</label>
                <Password
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  toggleMask
                  class="p-inputtext-sm"
                  :class="{ 'p-invalid': validationErrors['new_password'] }"
                />
                <small class="p-error" v-if="validationErrors['new_password']">{{
                  validationErrors['new_password'][0]
                }}</small>
              </div>
              <div class="field">
                <label for="confirmPassword" class="font-medium text-900"
                  >Confirmar nueva contraseña</label
                >
                <Password
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  :feedback="false"
                  toggleMask
                  class="p-inputtext-sm"
                  :class="{ 'p-invalid': validationErrors['new_password_confirmation'] }"
                />
                <small class="p-error" v-if="validationErrors['new_password_confirmation']">{{
                  validationErrors['new_password_confirmation'][0]
                }}</small>
              </div>
              <div class="flex justify-content-end mt-4">
                <Button
                  type="submit"
                  label="Cambiar contraseña"
                  icon="pi pi-lock"
                  :loading="estados.changingPassword"
                />
              </div>
            </form>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <Toast />

    <LeafletMapModal
      v-model="mapVisible"
      mode="select"
      :initialZoom="12"
      title="Selecciona una ubicación"
      @location-selected="handleLocationSelected"
    />
  </div>
</template>

<style scoped></style>
