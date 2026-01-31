import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthStatus, type ICredenciales, type IUsuario } from '../types'
import { AutorizacionService } from '../services/autenticacion.service'
import { useLocalStorage } from '@vueuse/core'
import type { ServiceResponse } from '@/common/utils/types/services.types'

export const useAuthStore = defineStore('auth', () => {
  const SESSION_TIMEOUT_MINUTES = 120
  const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000

  const authStatus = ref<AuthStatus>(AuthStatus.Checking)
  const usuario = ref<IUsuario | undefined>()
  const token = ref(useLocalStorage('token', ''))
  const expiresAt = ref<string | null>(localStorage.getItem('expiresAt') || null)
  const sessionModalOpen = ref(false)
  const sesionExpirada = ref(false)
  const sessionTimeout = ref<NodeJS.Timeout | null>(null)
  const lastActivity = ref<number | null>(Number(localStorage.getItem('lastActivity')) || null)

  const routePreviewLogin = ref<string | null>(null)

  const isSessionActive = computed(() => !!token.value && !!usuario.value)

  const initialize = () => {
    const savedUser = localStorage.getItem('user')
    const expired = isSessionExpired()

    if (savedUser && !expired) {
      usuario.value = JSON.parse(savedUser)
      authStatus.value = AuthStatus.Authenticated
      startSessionTimer()
    } else {
      clearSession()
    }
  }

  const login = async (credenciales: ICredenciales): Promise<ServiceResponse<any>> => {
    const lastUserEmail = localStorage.getItem('lastUserEmail')

    if (lastUserEmail && credenciales.email !== lastUserEmail) {
      return {
        status: 'error',
        message: 'Error_correo_distinto',
        errors: { email: [''] }
      }
    }

    try {
      const response = await AutorizacionService.iniciarSesion(credenciales)

      if (response.status !== 'success') {
        if (!response.errors) clearSession()
        return response
      }

      const data = response.data.data

      usuario.value = {
        ...data.user,
        accessToken: data.access_token,
        expiresAt: data.expires_at,
        tokenType: data.token_type
      }

      token.value = data.access_token
      expiresAt.value = data.expires_at
      authStatus.value = AuthStatus.Authenticated

      localStorage.setItem('user', JSON.stringify(usuario.value))
      localStorage.setItem('expiresAt', data.expires_at)

      sesionExpirada.value = false
      localStorage.removeItem('lastUserEmail')

      startSessionTimer()

      return response
    } catch {
      clearSession()
      return { status: 'error', message: 'Error de red' }
    }
  }

  const startSessionTimer = () => {
    clearSessionTimer()
    lastActivity.value = Date.now()
    localStorage.setItem('lastActivity', lastActivity.value.toString())

    sessionTimeout.value = setTimeout(() => {
      if (usuario.value?.email) {
        localStorage.setItem('lastUserEmail', usuario.value.email)
      }

      // Captura la ruta previa a la expiración, en memoria
      routePreviewLogin.value = window.location.pathname

      sessionModalOpen.value = true
      sesionExpirada.value = true
    }, SESSION_TIMEOUT_MS)

    window.addEventListener('mousemove', resetIdleTimer)
    window.addEventListener('keydown', resetIdleTimer)
  }

  const resetIdleTimer = () => {
    lastActivity.value = Date.now()
    localStorage.setItem('lastActivity', lastActivity.value.toString())

    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
    }

    sessionTimeout.value = setTimeout(() => {
      routePreviewLogin.value = window.location.pathname
      sessionModalOpen.value = true
      sesionExpirada.value = true
    }, SESSION_TIMEOUT_MS)
  }

  const clearSessionTimer = () => {
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
      sessionTimeout.value = null
    }

    window.removeEventListener('mousemove', resetIdleTimer)
    window.removeEventListener('keydown', resetIdleTimer)
  }

  const isSessionExpired = () => {
    const last = Number(localStorage.getItem('lastActivity'))
    if (!last) return true
    return Date.now() - last > SESSION_TIMEOUT_MS
  }

  const logout = async (): Promise<ServiceResponse<any>> => {
    let response: ServiceResponse<any>

    try {
      response = await AutorizacionService.cerrarSesion()
    } catch {
      response = {
        status: 'error',
        message: 'No se pudo contactar con el servidor.'
      }
    }

    clearSession()
    return response
  }

  const clearSession = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (currentUser?.email) {
      localStorage.setItem('lastUserEmail', currentUser.email)
    }

    authStatus.value = AuthStatus.Unauthenticated
    usuario.value = undefined
    expiresAt.value = null
    lastActivity.value = null
    sessionModalOpen.value = false
    sesionExpirada.value = false
    // routePreviewLogin.value = null

    clearSessionTimer()

    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('lastActivity')
  }

  return {
    usuario,
    token,
    expiresAt,
    authStatus,
    sessionModalOpen,
    sesionExpirada,
    routePreviewLogin,
    initialize,
    login,
    logout,
    clearSession,

    isChecking: computed(() => authStatus.value === AuthStatus.Checking),
    isAuthenticated: computed(() => authStatus.value === AuthStatus.Authenticated),
    nombre: computed(() => usuario.value?.persona?.nombre)
  }
})
