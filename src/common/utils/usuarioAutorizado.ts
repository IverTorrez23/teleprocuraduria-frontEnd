import { computed } from 'vue'
import { TipoUsuario } from '@/constants/constants'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

export const isUsuarioAutorizado = computed(() => {
  if (
    usuario.value?.tipo === TipoUsuario.ABOGADO_LIDER ||
    usuario.value?.tipo === TipoUsuario.ABOGADO_INDEPENDIENTE ||
    usuario.value?.tipo === TipoUsuario.ABOGADO_DEPENDIENTE
  ) {
    return true
  } else {
    return false
  }
})

export const isAbogadoAutorizado = computed(() => {
  if (
    usuario.value?.tipo === TipoUsuario.ABOGADO_LIDER ||
    usuario.value?.tipo === TipoUsuario.ABOGADO_INDEPENDIENTE ||
    usuario.value?.tipo === TipoUsuario.ABOGADO_DEPENDIENTE
    // usuario.value?.tipo === TipoUsuario.ADMINISTRADOR
  ) {
    return true
  } else {
    return false
  }
})

export const isUsuarioAbogadoLider = computed(() => {
  if (usuario.value?.tipo === TipoUsuario.ABOGADO_LIDER) {
    return true
  } else {
    return false
  }
})

export const isAbogadoINDEPEN_DEPEN = computed(() => {
  if (
    usuario.value?.tipo === TipoUsuario.ABOGADO_INDEPENDIENTE ||
    usuario.value?.tipo === TipoUsuario.ABOGADO_DEPENDIENTE
  ) {
    return true
  } else {
    return false
  }
})
