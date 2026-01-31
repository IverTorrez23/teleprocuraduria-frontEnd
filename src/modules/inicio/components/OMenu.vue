<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import { menuItems } from '../constants/menuItems'
import { useAuthModals } from '@/modules/auth/composables/useAuthModals'
import LoginModal from '@/modules/auth/views/LoginModal.vue'
import RegisterModal from '@/modules/auth/views/RegisterModal.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const { layoutConfig } = useLayout()
const topbarMenuActive = ref(false)
const { loginVisible, registerVisible, openLogin, openRegister } = useAuthModals()

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

onMounted(() => {
  bindOutsideClickListener()
})

onBeforeUnmount(() => {
  unbindOutsideClickListener()
})

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`
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
      <img :src="logoUrl" alt="logo" />
      <span>TELEPROCURADURIA</span>
    </router-link>

    <button
      class="p-link layout-topbar-menu-button-landing layout-topbar-button-landing"
      @click="onTopBarMenuButton"
    >
      <i class="pi pi-bars"></i>
    </button>

    <div class="layout-topbar-menu-landing" :class="topbarMenuClasses">
      <ul
        class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer"
      >
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple"
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
<style lang="scss" scoped></style>
