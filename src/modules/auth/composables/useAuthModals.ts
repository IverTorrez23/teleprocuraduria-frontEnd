import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const loginVisible = ref(false)
const registerVisible = ref(false)

export const useAuthModals = () => {
  const openLogin = () => {
    loginVisible.value = true
    registerVisible.value = false
  }

  const openRegister = () => {
    registerVisible.value = true
    loginVisible.value = false
  }

  const closeAll = () => {
    loginVisible.value = false
    registerVisible.value = false
  }

  return {
    loginVisible,
    registerVisible,
    openLogin,
    openRegister,
    closeAll
  }
}

export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    ...authStore
    // Puedes añadir más funciones aquí si es necesario
  }
}
