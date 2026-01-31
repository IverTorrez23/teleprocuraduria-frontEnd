<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import paqueteService from '@/modules/admin/Paquetes/services/paquete.service'
import type { IPaquete } from '@/modules/admin/Paquetes/types/paquete.types'
import type { ICompraPaquete } from '../types/compraPaquete.types'
import compraPaqueteService from '../services/compraPaquete.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
import { useAuthModals } from '@/modules/auth/composables/useAuthModals'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Auth
const authStore = useAuthStore()
const { isAuthenticated, routePreviewLogin } = storeToRefs(authStore)
const { openLogin } = useAuthModals()

const labelButton = ref('')
const disabledButtonCompra = ref(true)
const disabledButtonConfirmCompra = ref(false)
const idPaquete = Number(route.params.id) //Desde la Url
const paqueteSelected = ref<IPaquete>()
const fechaFinal = ref('')
const compraDialog = ref(false)

const compraPaquete = ref<ICompraPaquete>({
  id: 0,
  monto: 0,
  fecha_ini_vigencia: '',
  fecha_fin_vigencia: '',
  fecha_compra: '',
  dias_vigente: 0,
  paquete_id: 0,
  usuario_id: 0,
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const loadUnPaquete = async () => {
  const response = await paqueteService.obtenerUnPaquete(idPaquete)
  if (response) {
    paqueteSelected.value = response
    labelButton.value = 'Comprar por ' + paqueteSelected.value.precio + ' Bs.'

    const currentDate = new Date()
    const newDate = new Date(
      currentDate.setDate(currentDate.getDate() + paqueteSelected.value.cantidad_dias)
    )
    fechaFinal.value = newDate.toLocaleDateString()
    disabledButtonCompra.value = false
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos del paquete',
      life: 3000
    })
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    openLogin()
    routePreviewLogin.value = window.location.pathname
    return
  }
  loadUnPaquete()
})
watch(isAuthenticated, (newVal) => {
  if (newVal && !paqueteSelected.value) {
    loadUnPaquete()
  }
})
const confirmaCompraDialog = async () => {
  compraDialog.value = true
  disabledButtonConfirmCompra.value = false
}

const submitted = ref(false)

const saveCompraPaquete = async () => {
  disabledButtonConfirmCompra.value = true
  submitted.value = true
  if (!paqueteSelected.value?.id) return

  try {
    compraPaquete.value.monto = paqueteSelected.value.precio
    compraPaquete.value.paquete_id = paqueteSelected.value.id
    await compraPaqueteService.createCompraPaquete(compraPaquete.value)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Compra Exitosa',
      life: 2000
    })
    compraDialog.value = false
    setTimeout(() => {
      router.push('/mis-paquetes')
    }, 2000)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 10000 })
  }
}
</script>

<template>
  <div class="surface-section px-4 py-4 md:px-4 lg:px-8 text-left">
    <div class="mb-2 font-bold text-2xl">
      <span class="text-900">Paquete: {{ paqueteSelected?.nombre }} </span>
    </div>
    <div class="text-700 text-sm mb-3">
      {{ paqueteSelected?.descripcion }}
    </div>
    <div>
      <Message severity="success" :closable="false">
        <template #messageicon>
          <span class="pi pi-money-bill"></span>
        </template>
        <span class="ml-2">{{ paqueteSelected?.precio }} Bs.</span>
      </Message>
      <Message severity="success" :closable="false">
        <template #messageicon>
          <span class="pi pi-calendar-clock"></span>
        </template>
        <span class="ml-2">{{ paqueteSelected?.cantidad_dias }} Días</span>
      </Message>
      <h5>Detalles de compra:</h5>
      <div class="mb-3">
        <span
          >Este paquete tiene un costo de {{ paqueteSelected?.precio }} Bs, y podra crear y/o
          administrar sus causas, por el perido de {{ paqueteSelected?.cantidad_dias }} días,
          iniciando el perido hoy y finalizando en fecha {{ fechaFinal }} (si compra el paquete
          hoy)</span
        >
      </div>
    </div>
    <hr class="mb-3 mx-0 border-top-1 border-none surface-border mt-auto" />
    <Button
      :label="labelButton"
      class="p-3 w-full"
      @click="confirmaCompraDialog()"
      :disabled="disabledButtonCompra"
    ></Button>
  </div>

  <!-- Confirma compra -->
  <Dialog
    v-model:visible="compraDialog"
    :style="{ width: '450px' }"
    header="Confirmación"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >¿Confirma la compra del paquete <b>{{ paqueteSelected?.nombre }}</b> por
        <b>{{ paqueteSelected?.precio }}</b> Bs. ?</span
      >
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" class="p-button-text" @click="compraDialog = false" />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text"
        :disabled="disabledButtonConfirmCompra"
        @click="saveCompraPaquete"
      />
    </template>
  </Dialog>
</template>
