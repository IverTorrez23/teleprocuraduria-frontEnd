import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const loginVisible = ref(false)
const registerVisible = ref(false)
const tipoUsuarioRegistro = ref<string | null>(null)

const tiposPermitidos = [
  'ABOGADO_INDEPENDIENTE',
  'ABOGADO_LIDER'
]

export const useAuthModals = () => {

  const setTipoUsuarioRegistro = (
    tipo?: string | null
  ) => {
    tipoUsuarioRegistro.value =
      typeof tipo === 'string' &&
      tiposPermitidos.includes(tipo)
        ? tipo
        : null
  }

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

  const clearRegistrationContext = () => {
    tipoUsuarioRegistro.value = null
  }

  return {
    loginVisible,
    registerVisible,
    openLogin,
    openRegister,
    closeAll,
    tipoUsuarioRegistro,
    clearRegistrationContext,
    setTipoUsuarioRegistro
  }
}

export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    ...authStore
    // Puedes añadir más funciones aquí si es necesario
  }
}
