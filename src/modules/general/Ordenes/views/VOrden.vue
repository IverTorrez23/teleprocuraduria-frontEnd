<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useRoute } from 'vue-router'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'
import router from '@/router'
import type { IMenuItem } from '@/common/utils/types/menuItem.types'
import { isAbogadoAutorizado } from '@/common/utils/usuarioAutorizado'
import VListaOrdenGeneral from './VListaOrdenGeneral.vue'
import { TipoUsuario } from '@/constants/constants'
import VListaOrdenProcurador from './VListaOrdenProcurador.vue'
import VListaOrdenContador from './VListaOrdenContador.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const route = useRoute()
//const ordenes = ref<IOrden[]>([])

const idCausa = Number(route.params.idCausa)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

onMounted(() => {
  actualizarItems()
})
watch(
  () => filters.value.global.value,
  () => {}
)

const home = { label: 'Causas', route: { name: 'Causas' } }

const breadcrumbItems = [
  {
    label: `Ficha ${idCausa}`,
    route: { name: 'Ficha', params: { id: route.params.idCausa } }
  },
  {
    label: 'Lista Ordenes'
  }
]
const items = ref<IMenuItem[]>([])

const actualizarItems = () => {
  if (isAbogadoAutorizado.value === true) {
    items.value = [
      {
        label: 'Girar una orden',
        icon: 'pi pi-fw pi-plus',
        command: () => {
          router.push('/causas/ficha/lista-ordenes/crear-orden/' + idCausa)
        }
      },
      {
        label: 'Imprimir todo',
        icon: 'pi pi-fw pi-print',
        command: () => {
          console.log('imprimir todo')
        }
      },
      {
        label: 'Imprimir Fechas Tram. Orden',
        icon: 'pi pi-fw pi-print',
        command: () => {
          console.log('imprimir todo')
        }
      }
    ]
  }
}
</script>

<template>
  <DynamicBreadcrumb :home="home" :items="breadcrumbItems" class="mb-2" />

  <Menubar :model="items" class="card flex p-2 mb-2" />

  <div class="card p-3">
    <Toast />
    <VListaOrdenGeneral
      v-if="isAbogadoAutorizado || usuario?.tipo === TipoUsuario.ADMINISTRADOR"
      :causaId="idCausa"
    />
    <VListaOrdenProcurador
      v-if="
        usuario?.tipo === TipoUsuario.PROCURADOR || usuario?.tipo === TipoUsuario.PROCURADOR_MAESTRO
      "
      :causaId="idCausa"
      :procuradorId="usuario?.id"
    />
    <VListaOrdenContador v-if="usuario?.tipo === TipoUsuario.CONTADOR" :causaId="idCausa" />
  </div>
</template>
<style scoped lang="scss"></style>
