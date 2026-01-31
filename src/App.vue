<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FullScreenLoader from './common/components/Loader/FullScreenLoader.vue'
import { useAuthStore } from './modules/auth/stores/auth.store'
import { AuthStatus } from './modules/auth/types'
import LoginModal from './modules/auth/views/LoginModal.vue'

const authStore = useAuthStore()

// authStore.$subscribe(
//   (_,state)=>{
//     if(state.authStatus === AuthStatus.Checking)
//   {
//     authStore.che
//   }
//   }
// )

const { authStatus, sessionModalOpen, sesionExpirada } = storeToRefs(authStore)
</script>

<template>
  <!-- Mostrar el loader mientras el estado está en "Checking" -->
  <FullScreenLoader v-if="authStatus === AuthStatus.Checking" />

  <!-- Si ya no está verificando, mostramos el contenido -->
  <router-view v-else />

  <!-- Modal de sesión expirada -->
  <LoginModal :visible="sesionExpirada" />
</template>

<style scoped></style>
