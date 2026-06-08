<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import { menuItems } from '../constants/menuItems'
import { useAuthModals } from '@/modules/auth/composables/useAuthModals'
import LoginModal from '@/modules/auth/views/LoginModal.vue'
import RegisterModal from '@/modules/auth/views/RegisterModal.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service'
import { baseUrlResource } from '@/config/constants'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { layoutConfig } = useLayout()
const topbarMenuActive = ref(false)
const { loginVisible, registerVisible, openLogin, openRegister } = useAuthModals()

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

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
      imgLogo.value = logoUrl.value
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

const topbarMenuClasses = computed(() => ({
  'layout-topbar-menu-mobile-active-landing': topbarMenuActive.value
}))

const outsideClickListener = (event: MouseEvent) => {
  if (isOutsideClicked(event)) {
    topbarMenuActive.value = false
  }
}
const bindOutsideClickListener = () => {
  document.addEventListener('click', outsideClickListener)
}

const unbindOutsideClickListener = () => {
  document.removeEventListener('click', outsideClickListener)
}

const isOutsideClicked = (event: MouseEvent): boolean => {
  if (!topbarMenuActive.value) return false

  const sidebarEl = document.querySelector('.layout-topbar-menu-landing')
  const topbarEl = document.querySelector('.layout-topbar-menu-button-landing')

  return !(
    sidebarEl?.isSameNode(event.target as Node) ||
    sidebarEl?.contains(event.target as Node) ||
    topbarEl?.isSameNode(event.target as Node) ||
    topbarEl?.contains(event.target as Node)
  )
}
</script>

<template>
  <div class="layout-topbar-landing">
    <router-link to="/" class="layout-topbar-logo-landing">
      <img :src="imgLogo" alt="logo" style="width: 230px; height: 50px;"/>
      <!-- <span>TELEPROCURADURIA</span> -->
    </router-link>

    <button
      class="p-link layout-topbar-menu-button-landing layout-topbar-button-landing"
      @click="onTopBarMenuButton"
    >
      <i class="pi pi-bars"></i>
    </button>

    <div class="layout-topbar-menu-landing" :class="topbarMenuClasses">
      <ul
        class="list-none m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer"
      >
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="menu-link flex m-0 md:ml-5 px-1 py-2 text-900 font-medium line-height-3 p-ripple"
            v-ripple
          >
            <span class="text-center">{{ item.label }}</span>
          </router-link>
        </li>

        <div class="lg:hidden flex justify-content-between border-top-1 surface-border py-3">
          <Button
            v-if="isAuthenticated"
            label="Ir al panel"
            icon="pi pi-home"
            class="mr-3 p-button-success p-button-sm"
            @click="$router.push('/causas')"
          />
          <template v-else>
            <Button
              label="Registrarme"
              icon="pi pi-user-plus"
              class="mr-3 p-button-text p-button-sm"
              @click="openRegister"
            />
            <Button
              label="Iniciar Sesion"
              icon="pi pi-user"
              class="mr-3 p-button-raised p-button-sm"
              @click="openLogin"
            />
          </template>
        </div>
      </ul>
    </div>

    <div
      class="justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0 hidden lg:flex"
    >
      <Button
        v-if="isAuthenticated"
        label="Ir al panel"
        icon="pi pi-home"
        class="mr-3 p-button-success p-button-sm"
        @click="$router.push('/causas')"
      />
      <template v-else>
        <Button
          label="Registrarme"
          icon="pi pi-user-plus"
          class="mr-3 p-button-text p-button-sm"
          @click="openRegister"
        />
        <Button
          label="Iniciar Sesion"
          icon="pi pi-user"
          class="mr-3 p-button-raised p-button-sm"
          @click="openLogin"
        />
      </template>
    </div>

    <LoginModal :visible="loginVisible" @update:visible="(val: any) => (loginVisible = val)" />
    <RegisterModal
      :visible="registerVisible"
      @update:visible="(val: any) => (registerVisible = val)"
    />
  </div>
</template>
<style  scoped>
.menu-link {
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.menu-link:hover {
  background-color: #10b981;
  color: #ffffff !important;
   transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

/* Hace que el texto interno también cambie a blanco */
.menu-link:hover span {
  color: #ffffff !important;
}
</style>
