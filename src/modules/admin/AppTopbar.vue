<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import router from '@/router'
import { useToast } from 'primevue/usetoast'
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service'
import { baseUrlResource } from '@/config/constants'
import { useAuthStore } from '../auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const toast = useToast()
const tituloApp = import.meta.env.VITE_TITULO_APP
const { layoutConfig, onMenuToggle } = useLayout()
const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

const outsideClickListener = ref(null)
const topbarMenuActive = ref(false)
const cerrarSesionDialog = ref(false)

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`
})

const imgLogo = ref('')
const datosTablaConfig = ref()
const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    datosTablaConfig.value = response
    if (datosTablaConfig.value.imagen_logo) {
      imgLogo.value = `${baseUrlResource}/${datosTablaConfig.value.imagen_logo}`
    } else {
      imgLogo.value = logoUrl
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos',
      life: 3000
    })
  }
}

onMounted(() => {
  bindOutsideClickListener()
  loadDatosTablaConfig()
})

onBeforeUnmount(() => {
  unbindOutsideClickListener()
})

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value
}

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  }
})

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener)
    outsideClickListener.value = null
  }
}
const isOutsideClicked = (event) => {
  if (!topbarMenuActive.value) return

  const sidebarEl = document.querySelector('.layout-topbar-menu')
  const topbarEl = document.querySelector('.user-menu-container')

  return !(
    sidebarEl.isSameNode(event.target) ||
    sidebarEl.contains(event.target) ||
    topbarEl.isSameNode(event.target) ||
    topbarEl.contains(event.target)
  )
}

const confirmCerrarSesion = () => {
  cerrarSesionDialog.value = true
}

const cerrarSesion = async () => {
  try {
    const resultado = await authStore.logout()

    if (resultado?.status === 'success') {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: resultado.message || 'Sesión cerrada con éxito.',
        life: 3000
      })
      router.push('/')
      localStorage.removeItem('lastUserEmail')
    } else {
      throw new Error(resultado?.message || 'Error desconocido al cerrar sesión.')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Ocurrió un problema al cerrar sesión.',
      life: 3000
    })
  }
}

const getInitials = (nombre = '', apellido = '') => {
  const nameInitial = nombre?.charAt(0).toUpperCase() || ''
  const lastNameInitial = apellido?.charAt(0).toUpperCase() || ''
  return `${nameInitial}${lastNameInitial}`
}
</script>

<template>
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"
  />
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img :src="imgLogo" alt="logo" />
      <span>{{ tituloApp }}</span>
    </router-link>

    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <!-- Contenedor del menú de usuario -->

    <a
      href="https://api.whatsapp.com/send?phone=68792185&text=Hola%21%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%Teleprocuraduria%202."
      class="componente-w"
      target="_blank"
    >
      <i class="fa fa-whatsapp my-iconW"></i>
    </a>

    <div class="user-menu-container" @click="onTopBarMenuButton">
      <div class="user-avatar-container">
        <div v-if="!usuario?.persona?.foto_url" class="user-initials">
          {{ getInitials(usuario?.persona?.nombre, usuario?.persona?.apellido) }}
        </div>

        <img
          v-else
          :src="`${baseUrlResource}/${usuario?.persona?.foto_url}`"
          alt="User Avatar"
          class="user-initials"
        />
      </div>
      <!-- <span class="user-name">{{ usuario?.persona?.nombre }}</span>
      <i class="pi pi-angle-down"></i> -->
      <div class="flex flex-column align-items-start ml-2">
        <span class="user-name">{{ usuario?.persona?.nombre }}</span>
        <small class="user-role text-500">{{ usuario?.tipo }}</small>
        
      </div>

      <i class="pi pi-angle-down ml-2"></i>

      <!-- Menú desplegable -->
      <div class="layout-topbar-menu" :class="topbarMenuClasses">
        <button
          class="p-link layout-topbar-button"
          @click="$router.push({ path: '/configuracion/perfil' })"
        >
          <i class="pi pi-user"></i>
          <span>Perfil</span>
        </button>
        <button class="p-link layout-topbar-button">
          <i class="pi pi-cog"></i>
          <span>Configuración</span>
        </button>
        <button class="p-link layout-topbar-button">
          <i class="pi pi-question-circle"></i>
          <span>Help</span>
        </button>
        <Divider />
        <button @click="confirmCerrarSesion" class="p-link layout-topbar-button">
          <i class="pi pi-sign-out"></i>
          <span>Salir</span>
        </button>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="cerrarSesionDialog"
    :style="{ width: '450px' }"
    header="Confirmación"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: #f39c12" />

      <span v-if="usuario"
        ><b>{{ usuario?.name || 'invitado' }} </b>¿ Está seguro de cerrar la sesión?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text p-button-danger"
        @click="cerrarSesionDialog = false"
      />
      <Button label="Si" icon="pi pi-check" class="p-button-text" @click="cerrarSesion" />
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.user-menu-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
}

.user-avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-initials {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  text-transform: uppercase;
}

.user-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color, #333);
  white-space: nowrap;
}
// Estilos para el boton whatsapp
.componente-w {
  width: 40px;
  height: 40px;
  bottom: 40px;
  right: 40px;
  background-color: #25d366;
  color: #fff;
  border-radius: 50px;
  text-align: center;
  font-size: 30px;
  box-shadow: 2px 2px 3px #999;
  z-index: 100;
}
.componente-w:hover {
  text-decoration: none;
  color: #25d366;
  background-color: #fff;
}

.my-iconW {
  margin-top: 6px;
}
.user-role {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  margin-top: 0.1rem;
}
</style>
